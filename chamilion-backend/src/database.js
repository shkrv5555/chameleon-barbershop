import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

function createDb(filename) {
  const adapter = new JSONFile(join(DATA_DIR, filename));
  return new Low(adapter, {});
}

// Individual DBs per collection
export const adminDb = createDb('admin.json');
export const reservationsDb = createDb('reservations.json');
export const servicesDb = createDb('services.json');
export const blogDb = createDb('blog.json');

export async function initDb() {
  // Admin
  await adminDb.read();
  if (!adminDb.data || !adminDb.data.admin) {
    const hash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'Chamilion2020!', 10);
    adminDb.data = { admin: { username: 'admin', passwordHash: hash } };
    await adminDb.write();
    console.log('Admin yaradıldı: admin / Chamilion2020!');
  }

  // Reservations
  await reservationsDb.read();
  if (!reservationsDb.data || !reservationsDb.data.reservations) {
    reservationsDb.data = { reservations: [] };
    await reservationsDb.write();
  }

  // Services
  await servicesDb.read();
  if (!servicesDb.data || !servicesDb.data.services) {
    servicesDb.data = {
      services: [
        { id: 1, name: 'Saç kəsimi', description: 'Klassik kişi saç kəsimi, yuma və şekillendirme daxil', price: 15, duration: 60, icon: 'Scissors' },
        { id: 2, name: 'Saqqal düzəldilməsi', description: 'Dəqiq saqqal dizaynı, ülgüclə hamarlanma', price: 10, duration: 30, icon: 'Blade' },
        { id: 3, name: 'Tam paket', description: 'Saç kəsimi + saqqal düzəldilməsi birlikdə', price: 22, duration: 90, icon: 'Crown' },
        { id: 4, name: 'Baş masajı', description: 'Rahatlandırıcı baş masajı', price: 8, duration: 20, icon: 'Hand' },
        { id: 5, name: 'Uşaq saç kəsimi', description: '12 yaşa qədər uşaqlar üçün xüsusi qiymət', price: 10, duration: 45, icon: 'Baby' }
      ]
    };
    await servicesDb.write();
  }

  // Blog
  await blogDb.read();
  if (!blogDb.data || !blogDb.data.posts) {
    blogDb.data = {
      posts: [
        {
          id: 1,
          title: '2024-cü ilin ən populyar saç trendləri',
          excerpt: 'Bu il kişi saç modaları haqqında bilmək istədikləriniz — fade, textured crop və daha çox.',
          content: '2024-cü il kişi saç dünyasında bir çox yeni trend gətirdi. Fade kəsimlər hələ də populyarlığını qoruyur, lakin artıq daha çox textured üst hissə ilə birləşdirilir. Buzz cut klassik görünüşü ilə geri döndü. Dəbdə olan saç modellərini peşəkar bərberimizlə birlikdə seçə bilərsiniz.',
          createdAt: '2024-11-15T10:00:00.000Z'
        },
        {
          id: 2,
          title: 'Saqqal qulluğu üçün 5 əsas ipucu',
          excerpt: 'Sağlam və şık saqqal saxlamaq üçün gündəlik rutin haqqında tövsiyələr.',
          content: 'Sağlam saqqal saxlamaq üçün gündəlik qulluq çox vacibdir. 1. Hər gün yuyun — saqqal şampunu və ya yumşaq üz yuma vasitəsi ilə. 2. Nəmləndirin — saqqal yağı və ya balzam ilə. 3. Düzgün darayın — saqqal darayacağı ilə. 4. Mütəmadi kəsin — uc hissələri qırpın. 5. Peşəkara gedin — hər 2-3 həftədə bir bərbərə.',
          createdAt: '2024-10-20T10:00:00.000Z'
        },
        {
          id: 3,
          title: 'Chamilion Barbershop — 2020-dən bu günə',
          excerpt: '4 il ərzindəki yolumuz, müştərilərimizə təşəkkür və yeniliklər haqqında.',
          content: '2020-ci ildə kiçik bir arzuyla başladığımız bu yolda artıq 4 ildən artıqdır sizinlə birgəyik. Hər kəsim, hər gülüş, hər müştərimiz bu yolculuğun bir parçası oldu. Chamilion Barbershop olaraq keyfiyyəti, dəqiqliyi və müştəri məmnuniyyətini həmişə ön planda tutduq. Sizin güvəniniz bizim ən böyük mükafatımızdır.',
          createdAt: '2024-09-01T10:00:00.000Z'
        }
      ]
    };
    await blogDb.write();
  }

  console.log('Verilənlər bazası hazırdır.');
}
