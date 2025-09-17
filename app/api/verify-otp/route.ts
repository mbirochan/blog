export async function POST() {
  return new Response(
    JSON.stringify({ error: "OTP verification is handled via the credentials provider." }),
    { status: 410 },
  )
}
