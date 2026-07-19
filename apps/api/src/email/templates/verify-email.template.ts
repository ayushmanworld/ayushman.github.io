export function verifyEmailTemplate(params: {
  name: string
  verifyUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify Your Email — Ayushman</title></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'DM Sans',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-family:Georgia,serif;color:#1E2D3D;font-size:28px;margin:0 0 4px;">Ayushman</h1>
    <p style="color:#C8782A;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0;">
      Empowering Abilities. Enriching Lives.
    </p>
  </div>

  <div style="background:white;border-radius:16px;padding:40px;border:1px solid #DDD6C8;text-align:center;">
    <div style="font-size:48px;margin-bottom:20px;">✉️</div>
    <h2 style="font-family:Georgia,serif;color:#1E2D3D;font-size:24px;margin:0 0 16px;">
      Verify your email address
    </h2>
    <p style="color:#6B5D50;font-size:15px;line-height:1.8;margin:0 0 28px;">
      Hi ${params.name}, please click the button below to verify your email address
      and activate your Ayushman account. This link expires in <strong>24 hours</strong>.
    </p>
    <a href="${params.verifyUrl}"
       style="display:inline-block;background:#C8782A;color:white;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px;">
      Verify Email Address →
    </a>
    <p style="color:#B8A898;font-size:12px;margin:0 0 8px;">
      If you did not create an account, you can safely ignore this email.
    </p>
    <p style="color:#B8A898;font-size:11px;margin:0;">
      Or copy this URL: <span style="color:#2D7A6B;">${params.verifyUrl}</span>
    </p>
  </div>

  <div style="text-align:center;margin-top:24px;">
    <p style="color:#B8A898;font-size:11px;margin:0;">
      © 2026 Ayushman · <a href="https://ayushman.world" style="color:#C8782A;">ayushman.world</a>
    </p>
  </div>
</div>
</body>
</html>
  `.trim()
}
