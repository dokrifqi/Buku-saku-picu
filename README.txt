BUKU SAKU PICU - PWA

Cara memperbarui aplikasi
1. Ganti file index.html dengan versi baru, lalu unggah ulang ke hosting.
2. Selesai. Tidak perlu mengubah sw.js dan tidak perlu menghapus cache di HP.
   - Saat aplikasi dibuka, index.html selalu diambil dari internet lebih dulu.
   - Bila aplikasi sedang terbuka di latar belakang, versi baru terdeteksi saat Anda kembali ke aplikasi dan halaman dimuat ulang otomatis.
   - Bila aplikasi dibiarkan terbuka lama, muncul tombol "Muat ulang" di bagian bawah.
   - Tanpa internet, aplikasi memakai salinan terakhir yang tersimpan.

Hosting
- Vercel atau Netlify: file vercel.json dan _headers sudah mengatur agar index.html, sw.js, dan manifest tidak di-cache. Pembaruan langsung terlihat.
- GitHub Pages: tidak bisa mengatur header, jadi pembaruan kadang tertunda sampai sekitar 10 menit.

Hanya naikkan angka CACHE di sw.js (saku-picu-v2 menjadi v3) bila Anda mengganti file ikon.
