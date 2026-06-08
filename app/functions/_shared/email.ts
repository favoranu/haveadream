type SendVerifyEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  verifyUrl: string;
};

export async function sendVerificationEmail(input: SendVerifyEmailInput) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: 'Confirm your $HAD newsletter subscription',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#02183D;max-width:560px">
          <h2 style="margin:0 0 12px">Confirm your email</h2>
          <p>Thanks for signing up for $HAD updates at <strong>haveadream.xyz</strong>.</p>
          <p>Click the button below to verify this address belongs to you. The link expires in 24 hours.</p>
          <p style="margin:28px 0">
            <a href="${input.verifyUrl}" style="background:#4C47F7;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;display:inline-block">
              Verify my email
            </a>
          </p>
          <p style="font-size:13px;color:#555">If you did not request this, you can ignore this message.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Email send failed (${res.status}): ${detail}`);
  }
}