import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// On utilise la clé SERVICE_ROLE ici car elle seule peut lire les emails dans auth.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { clientName, rating, content, spaceName, ownerId } = await req.json();

    // 1. Récupérer l'email de l'owner depuis Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(ownerId);
    
    const targetEmail = userData?.user?.email;

    if (!targetEmail || userError) {
      return NextResponse.json({ error: "Email non trouvé" }, { status: 404 });
    }

    // 2. Envoyer l'email via Resend
    await resend.emails.send({
      from: 'TestiWall <onboarding@resend.dev>',
      to: targetEmail,
      subject: `🌟 Nouvel avis de ${clientName} !`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
          <h1 style="color: #7c3aed;">Nouveau témoignage !</h1>
          <p>Bonne nouvelle ! Un client a laissé un avis sur <strong>${spaceName}</strong>.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-weight: bold;">${clientName}</p>
            <p style="font-size: 24px; margin: 10px 0;">${'⭐'.repeat(rating)}</p>
            <p style="font-style: italic; color: #475569;">"${content}"</p>
          </div>
          <br />
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #7c3aed; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Gérer mes avis</a>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}