# ==============================================================================
# Ayushman Platform — AWS Infrastructure
# Region: ap-south-1 (Mumbai — India primary)
# ==============================================================================

terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket         = "ayushman-terraform-state"
    key            = "platform/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "ayushman-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Ayushman"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Ayushman NGO"
    }
  }
}

# ─────────────────────────────────────────────────
# Data Sources
# ─────────────────────────────────────────────────

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ─────────────────────────────────────────────────
# VPC
# ─────────────────────────────────────────────────

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.9"

  name = "ayushman-${var.environment}"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  database_subnets = var.database_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  enable_dns_hostnames   = true
  enable_dns_support     = true

  create_database_subnet_group = true
  create_database_subnet_route_table = true
}

# ─────────────────────────────────────────────────
# RDS — PostgreSQL 16
# ─────────────────────────────────────────────────

resource "aws_db_subnet_group" "ayushman" {
  name       = "ayushman-${var.environment}"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_security_group" "rds" {
  name        = "ayushman-rds-${var.environment}"
  description = "Allow PostgreSQL from ECS tasks only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
    description     = "PostgreSQL from ECS tasks"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_parameter_group" "ayushman" {
  name   = "ayushman-pg16-${var.environment}"
  family = "postgres16"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,vector"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = var.environment == "production" ? "2000" : "500"
  }
}

resource "aws_db_instance" "ayushman" {
  identifier = "ayushman-${var.environment}"

  engine         = "postgres"
  engine_version = "16.3"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "ayushman"
  username = "ayushman"
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.ayushman.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.ayushman.name

  multi_az               = var.environment == "production"
  publicly_accessible    = false
  skip_final_snapshot    = var.environment != "production"
  deletion_protection    = var.environment == "production"
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "02:00-03:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  performance_insights_enabled = var.environment == "production"
  monitoring_interval          = var.environment == "production" ? 60 : 0

  lifecycle {
    prevent_destroy = false
    ignore_changes  = [password]
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

# ─────────────────────────────────────────────────
# ElastiCache — Redis 7
# ─────────────────────────────────────────────────

resource "aws_security_group" "redis" {
  name        = "ayushman-redis-${var.environment}"
  description = "Allow Redis from ECS tasks only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
    description     = "Redis from ECS tasks"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_subnet_group" "ayushman" {
  name       = "ayushman-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "ayushman" {
  replication_group_id = "ayushman-${var.environment}"
  description          = "Ayushman Redis ${var.environment}"

  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.ayushman.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth.result

  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled           = var.environment == "production"

  lifecycle {
    ignore_changes = [auth_token]
  }
}

resource "random_password" "redis_auth" {
  length  = 32
  special = false
}

# ─────────────────────────────────────────────────
# S3 Buckets
# ─────────────────────────────────────────────────

resource "aws_s3_bucket" "uploads" {
  bucket = "ayushman-uploads-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ─────────────────────────────────────────────────
# ECS Cluster
# ─────────────────────────────────────────────────

resource "aws_ecs_cluster" "ayushman" {
  name = "ayushman-${var.environment}"

  setting {
    name  = "containerInsights"
    value = var.environment == "production" ? "enabled" : "disabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "ayushman" {
  cluster_name       = aws_ecs_cluster.ayushman.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = var.environment == "production" ? "FARGATE" : "FARGATE_SPOT"
    weight            = 1
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "ayushman-ecs-tasks-${var.environment}"
  description = "Allow outbound from ECS tasks"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound"
  }

  ingress {
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "API from ALB"
  }
}

# ─────────────────────────────────────────────────
# Application Load Balancer
# ─────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "ayushman-alb-${var.environment}"
  description = "Allow HTTP/HTTPS from internet"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "ayushman" {
  name               = "ayushman-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = var.environment == "production"

  access_logs {
    bucket  = aws_s3_bucket.uploads.id
    prefix  = "alb-logs"
    enabled = var.environment == "production"
  }
}

# ─────────────────────────────────────────────────
# Secrets Manager
# ─────────────────────────────────────────────────

resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "ayushman/${var.environment}/app"
  description             = "Ayushman application secrets"
  recovery_window_in_days = var.environment == "production" ? 7 : 0
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL           = "postgresql://ayushman:${random_password.db_password.result}@${aws_db_instance.ayushman.address}:5432/ayushman"
    REDIS_URL              = "rediss://:${random_password.redis_auth.result}@${aws_elasticache_replication_group.ayushman.primary_endpoint_address}:6379"
    JWT_ACCESS_SECRET      = random_password.jwt_access.result
    JWT_REFRESH_SECRET     = random_password.jwt_refresh.result
  })
}

resource "random_password" "jwt_access" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = false
}
