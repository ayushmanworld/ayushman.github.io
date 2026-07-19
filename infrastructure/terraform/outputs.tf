output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.ayushman.address
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache primary endpoint"
  value       = aws_elasticache_replication_group.ayushman.primary_endpoint_address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.ayushman.name
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.ayushman.dns_name
}

output "s3_uploads_bucket" {
  description = "S3 uploads bucket name"
  value       = aws_s3_bucket.uploads.bucket
}

output "secrets_manager_arn" {
  description = "App secrets ARN"
  value       = aws_secretsmanager_secret.app_secrets.arn
  sensitive   = true
}
