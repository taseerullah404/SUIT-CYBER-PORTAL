# SUIT Cyber — Cybersecurity Department Portal
Sarhad University of Science & Information Technology, Peshawar

Full-stack portal: public website + **Admin**, **Teacher** and **Student** portals for the 8-semester BS Cybersecurity programme.

## Run on your computer
Needs Node.js 20 or newer (https://nodejs.org).

```bash
npm install
npm run demo      # demo data: 3 teachers, 6 students, sample notices/assignments
# open http://localhost:3000
```

Demo logins (demo mode only, password `Demo@12345`; admin password `Admin@12345`):

| Role | Email |
|---|---|
| Admin | admin@suit.edu.pk (Admin@12345) |
| Teacher | t.imran@suit.edu.pk, t.sana@suit.edu.pk, t.bilal@suit.edu.pk |
| Student | s.ali@suit.edu.pk (Sem 1), s.usman@suit.edu.pk (Sem 3, has results), s.hamza@suit.edu.pk (Sem 5) … |

## Real use (no demo data)
Copy `.env.example` to `.env`, put your admin email and a strong password in it, then:
```bash
npm start
```
If you do not set ADMIN_PASSWORD a random one is printed once on first start. On first run the 8-semester course list is created (sample scheme, edit it in Admin → Courses to match the official one). Then:
1. Admin → **Teachers**: add teachers. Admin → **Courses**: assign teachers.
2. Admin → **Students**: add one by one or **Import many** (paste `name, email, reg_no, semester`). Each account gets a temporary password and must change it on first login.

## What each role can do
- **Admin**: dashboard, add/edit/disable students and teachers, reset passwords, bulk import, manage courses per semester, assign teachers, **semester promotion** (Sem 8 -> Graduated), notices to everyone / students / teachers / a semester / a course.
- **Teacher** (only own courses): upload material (file or link), create assignments with deadline, view and grade submissions with feedback, mark attendance (P/A/L) with summary, enter Sessional/Mid/Final marks and **publish** results, post course notices.
- **Student** (only own semester + earlier ones): dashboard, current-semester courses, material, submit/resubmit assignments, see marks and feedback, attendance % per course, published results with **SGPA / CGPA**, printable transcript, notices. Future semesters are locked.

## Security built in
bcrypt password hashing, HttpOnly + SameSite=Strict cookie sessions, role checked from the database on every request, login rate limiting, strict Content-Security-Policy, CSRF origin check, parameterised SQL, upload type/size limits with random file names, file downloads checked per user, no stack traces to users.

## Deploy online
Needs a host that runs Node and keeps a disk: Railway, Render (with a persistent disk), a VPS, or a spare PC on the department network.
Set these environment variables:
- `NODE_ENV=production`
- `TRUST_PROXY=1` (when behind the host's HTTPS proxy)
- `DATA_DIR` and `UPLOAD_DIR` pointing at the persistent disk (database and uploaded files live there)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` for the first start
Start command: `npm start`. Back up the data folder regularly. Netlify cannot host this app (it only serves static files); use Netlify only for the public pages if you ever split them.

## Customise
- Grading scale and marks split (20/30/50): `src/util.js`
- Courses: Admin panel (seed list in `src/seed.js`)
- Colours: top of `public/css/style.css`
