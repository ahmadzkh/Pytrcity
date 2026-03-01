export default function Services() {
  const features = [
    {
      title: "Pengecekan Instan",
      desc: "Validasi nama pelanggan dan nominal tagihan langsung dari server pusat.",
    },
    {
      title: "Metode Beragam",
      desc: "Dukungan pembayaran melalui Bank Transfer, Virtual Account, dan E-Wallet.",
    },
    {
      title: "Manajemen Properti",
      desc: "Simpan berbagai ID Pelanggan untuk rumah, toko, atau properti sewaan Anda.",
    },
  ];

  return (
    <section
      id="services"
      className="w-full bg-white py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Layanan <span className="text-electric-500">Utama</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-gray-50"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
