# The Paint Reverie — socle du projet

## 1. Créer le projet
```bash
npx create-next-app@latest paint-reverie --ts --tailwind --app --src-dir --eslint
cd paint-reverie
npm i @supabase/supabase-js resend zod
```
Copie ensuite dans le projet les dossiers `src/lib`, `src/app/api`, `supabase/` et le fichier `.env.example` (renomme-le `.env.local`).

## 2. Supabase
1. Crée un projet Supabase, puis exécute `supabase/migrations/0001_init.sql` (SQL Editor, ou `supabase db push`).
2. Renseigne dans `.env.local` : URL, clé anon, clé service role (Settings > API).
3. Crée le compte de Fatima dans Authentication > Users (pour l'admin, étape suivante).

## 3. Resend
Crée un compte, vérifie ton domaine d'envoi, mets `RESEND_API_KEY`, `EMAIL_FROM` et `NOTIFY_EMAIL` (adresse de Fatima).

## 4. Images Supabase dans next/image (`next.config.ts`)
```ts
images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] }
```

## 5. Tester les routes
```bash
npm run dev
curl -X POST localhost:3000/api/private-requests -H 'content-type: application/json' \
  -d '{"firstName":"Awa","lastName":"Diop","phone":"+221770000000","email":"awa@test.com","eventType":"Anniversaire","participants":12}'
```
Pour une réservation, crée d'abord un atelier `open` dans la table `workshops`, puis POST `/api/bookings` avec son `id` comme `workshopId`.

## 6. Déployer
Importe le repo dans Vercel, ajoute les variables de `.env.example`, déploie.

## Notes
- Aucun atelier test n'est créé en base (cahier des charges §25).
- Les places restantes viennent de la vue `workshops_availability`. La réservation passe par `book_seats()`, atomique, donc pas de surréservation.
- `bookings` et `private_requests` n'ont aucune policy RLS : seules les routes serveur (service role) y accèdent.
