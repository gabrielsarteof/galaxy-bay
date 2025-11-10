export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              Descubra, colecione e venda NFTs extraordinários
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              O marketplace líder para colecionadores e criadores digitais
            </p>
            <div className="flex gap-4">
              <a
                href="/marketplace"
                className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Explorar
              </a>
              <a
                href="/create-page"
                className="px-8 py-3 bg-transparent border-2 border-white rounded-full font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Criar
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">2.5M+</div>
              <div className="text-blue-100">NFTs criados</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">1.2M+</div>
              <div className="text-blue-100">Usuários ativos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">450K+</div>
              <div className="text-blue-100">Vendas totais</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">12.5K ETH</div>
              <div className="text-blue-100">Volume total</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
