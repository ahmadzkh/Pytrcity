export default function Contact() {
  return (
    <section
      id="contact"
      className="w-full bg-gray-900 text-white py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Butuh <span className="text-electric-500">Bantuan?</span>
        </h2>
        <p className="text-lg text-gray-400 mb-10">
          Tim dukungan teknis kami siap membantu Anda menyelesaikan masalah
          transaksi atau memberikan panduan integrasi.
        </p>
        <a
          href="mailto:support@pytricity.com"
          className="inline-block bg-electric-500 hover:bg-electric-600 text-white font-semibold py-3 px-8 rounded-full transition-colors"
        >
          Hubungi Tim Dukungan
        </a>
      </div>
    </section>
  );
}
