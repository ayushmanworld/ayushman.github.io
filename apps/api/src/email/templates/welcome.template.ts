export function welcomeTemplate(params: { name: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Ayushman</title></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'DM Sans',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-family:Georgia,serif;color:#1E2D3D;font-size:28px;margin:0 0 4px;">Ayushman</h1>
    <p style="color:#C8782A;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0;">
      Empowering Abilities. Enriching Lives.
    </p>
  </div>

  <!-- Card -->
  <div style="background:white;border-radius:16px;padding:40px;border:1px solid #DDD6C8;">
    <h2 style="font-family:Georgia,serif;color:#1E2D3D;font-size:24px;margin:0 0 16px;">
      Welcome, ${params.name}! 💛
    </h2>
    <p style="color:#6B5D50;font-size:15px;line-height:1.8;margin:0 0 16px;">
      You've joined a community of families, therapists, educators and researchers working together to ensure
      every child with autism or ADHD has the support they deserve.
    </p>
    <p style="color:#6B5D50;font-size:15px;line-height:1.8;margin:0 0 24px;">
      Here's what you can do on Ayushman:
    </p>

    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:20px;flex-shrink:0;">🔍</span>
        <div>
          <div style="font-weight:700;color:#1E2D3D;font-size:14px;">Find Help Near You</div>
          <div style="color:#6B5D50;font-size:13px;">Discover verified therapy centres, schools and resources in your city.</div>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:20px;flex-shrink:0;">🤖</span>
        <div>
          <div style="font-weight:700;color:#1E2D3D;font-size:14px;">Ask Our AI Assistant</div>
          <div style="color:#6B5D50;font-size:13px;">Get personalised guidance on therapy, schools and government schemes.</div>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:20px;flex-shrink:0;">👨‍👩‍👧</span>
        <div>
          <div style="font-weight:700;color:#1E2D3D;font-size:14px;">Join the Community</div>
          <div style="color:#6B5D50;font-size:13px;">Connect with other families navigating the same journey.</div>
        </div>
      </div>
    </div>

    <a href="https://ayushman.world" style="display:block;background:#C8782A;color:white;text-align:center;padding:14px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
      Explore Ayushman →
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;margin-top:24px;">
    <p style="color:#6B5D50;font-size:12px;margin:0 0 4px;">
      Questions? <a href="mailto:support@ayushman.world" style="color:#C8782A;">support@ayushman.world</a>
      or call <a href="tel:+918280056665" style="color:#C8782A;">+91 82800 56665</a>
    </p>
    <p style="color:#B8A898;font-size:11px;margin:0;">
      Made with ♥ for Ayushman — and every extraordinary child like him.
    </p>
  </div>

</div>
</body>
</html>
  `.trim()
}
