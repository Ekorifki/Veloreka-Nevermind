export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'promo', // 'promo' | 'order' | 'system'
    title: 'Diskon Spesial 30% Pembelian Pertama!',
    message:
      'Gunakan kode kupon 6B98T409 saat checkout untuk menikmati potongan 30% koleksi Y2K & Streetwear pilihanmu.',
    time: 'Baru saja',
    dateGroup: 'Hari Ini',
    isRead: false,
    actionScreen: 'home',
  },
  {
    id: 'notif-2',
    type: 'order',
    title: 'Pesanan #VLK-2094 Sedang Dikirim',
    message:
      'Paket Calthorys 22 Athletic Jersey (Size L) telah diserahkan ke kurir menuju alamat Home (DI. PandjaitanMok).',
    time: '25 menit lalu',
    dateGroup: 'Hari Ini',
    isRead: false,
    actionScreen: 'cart',
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Keamanan Akun & Sesi Login Baru',
    message:
      'Akun Veloreka Anda baru saja berhasil masuk pada perangkat Linux Mobile Web Preview.',
    time: '2 jam lalu',
    dateGroup: 'Hari Ini',
    isRead: false,
    actionScreen: 'account',
  },
  {
    id: 'notif-4',
    type: 'promo',
    title: 'Flash Drop: Calthorys Sport Division',
    message:
      'Stok terbatas koleksi Varsity & Mesh Jersey kini tersedia. Klaim voucher NEVERMIND22 sebelum kehabisan!',
    time: 'Kemarin, 19:30',
    dateGroup: 'Kemarin',
    isRead: true,
    actionScreen: 'details',
  },
  {
    id: 'notif-5',
    type: 'order',
    title: 'Pembayaran Berhasil Dikonfirmasi',
    message:
      'Pembayaran via VISA **** 7110 untuk pesanan #VLK-2094 telah terverifikasi secara otomatis.',
    time: 'Kemarin, 14:15',
    dateGroup: 'Kemarin',
    isRead: true,
    actionScreen: 'checkout',
  },
  {
    id: 'notif-6',
    type: 'system',
    title: 'Alamat Pengiriman Utama Tersimpan',
    message:
      'Alamat "Home — DI. PandjaitanMok" telah diatur sebagai alamat pengiriman utama Anda.',
    time: '2 hari lalu',
    dateGroup: 'Sebelumnya',
    isRead: true,
    actionScreen: 'address',
  },
];
