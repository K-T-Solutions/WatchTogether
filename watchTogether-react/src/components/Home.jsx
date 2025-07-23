import FlyingShips from "./FlyingShips";
import Header from "./Header";
import danceGif from "../assets/dance.gif";

export default function Home({ onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout, onRoomCreate }) {
  return (
    <div className="min-h-screen bg-[#070710]" id="top">
      <FlyingShips />
      <Header 
        onLogin={onLogin} 
        onRegister={onRegister} 
        onProfile={onProfile}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <div className="pt-40 w-full flex flex-col items-center">
        <div className="neon-bg-section" style={{ minHeight: '83vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <section className="w-full flex flex-col md:flex-row items-center justify-center px-6 md:px-0 py-16 gap-12 flex-1">
            {/* Левая часть: окно для промо-видео */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="bg-[#181828] rounded-2xl shadow-lg w-[425px] h-[240px] md:w-[525px] md:h-[325px] flex items-center justify-center border-2 border-[#1a023f]/40">
                {/*<span className="text-gray-500 text-base select-none">Промо-видео скоро</span>*/}
                <img
                    src={danceGif}
                    alt="Promo Dance"
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
              </div>


            </div>
            {/* Правая часть: тексты */}
            <div className="w-full md:w-1/2 flex flex-col items-start md:items-start text-left relative">
              <div className="absolute -z-10 left-0 top-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#1a023f]/60 via-[#181828]/80 to-[#070710]/80 blur-sm"></div>
              <span className="uppercase text-xs text-indigo-400 font-semibold mb-2 tracking-widest flex items-center">
                <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 mr-2"></span>
                Watch. Chat. Feel together
              </span>
              <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-3 leading-tight drop-shadow-lg">
                Watch together, wherever you are!
              </h2>
              <p className="text-gray-200 text-lg md:text-xl pr-32 font-medium mb-4">
                Create your space, invite your crew, and turn every watch into a shared adventure
              </p>
              <p className="text-gray-400 text-base pr-32 md:text-lg mb-4">
                WatchTogether creates synchronized viewing experiences with real-time reactions, voice chat, and interactive features that make distance disappear during your favorite shows and movies
              </p>
              <a href="#host" className="gradient-border mt-2" onClick={e => { e.preventDefault(); onRoomCreate && onRoomCreate(); }}>
                <span className="gradient-btn text-base md:text-lg font-bold px-6 py-2">Try Now</span>
              </a>
            </div>
          </section>
          <section id="services" className="w-full flex flex-col items-center py-12 bg-transparent flex-shrink-0">
            <h3 className="text-white text-xl font-bold mb-6">Доступно для просмотра на:</h3>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" alt="YouTube" className="h-10 mb-2" />
                <span className="text-gray-300 text-sm">YouTube</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-10 mb-2" />
                <span className="text-gray-300 text-sm">Netflix</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" className="h-10 mb-2" />
                <span className="text-gray-300 text-sm">Disney+</span>
              </div>
              {/* Добавьте другие сервисы по желанию */}
            </div>
          </section>

        </div>
        {/* Градиентная линия-разделитель */}
        <div className="w-full py-15 bg-[#070710]">
          <div
              className="h-0.5 opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #4063bd 30%, #e8652d 70%, transparent 100%)'
              }}
          ></div>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full flex flex-col items-center py-0">
          {/*<h3 className="text-white text-2xl font-bold mb-10 mt-16">Главные возможности WatchTogether</h3>*/}
          {/* Feature 1 */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between py-12 px-4 md:px-24
           bg-[#070710]
           rounded-2xl shadow-2xl">
            <div className="w-full md:w-1/2 flex flex-col items-start mb-8 md:mb-0">
              <span className="mb-4 text-4xl">💬</span>
              <h4 className="text-white text-2xl font-semibold mb-2">Общий чат и реакции</h4>
              <p className="text-gray-300 text-lg">Общайтесь в реальном времени, делитесь эмоциями и используйте реакции, чтобы сделать просмотр ещё веселее и живее.</p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="bg-[#232346] rounded-2xl shadow-lg w-[510px] h-[285px] md:w-[630px] md:h-[360px] flex items-center justify-center">
                <span className="text-gray-500 text-base select-none">Промо-видео скоро</span>
              </div>
            </div>
          </div>
          {/* Feature 2 */} /*TODO: change bg color*/
          <div className="w-full flex flex-col md:flex-row items-center justify-between py-12 px-4 md:px-24
           bg-gradient-to-l from-[#1a023f] to-[#070710] 
           rounded-2xl shadow-2xl">
            <div className="w-full md:w-1/2 flex flex-col items-start mb-8 md:mb-0">
              <span className="mb-4 text-4xl">🔗</span>
              <h4 className="text-white text-2xl font-semibold mb-2">Лёгкое приглашение друзей</h4>
              <p className="text-gray-300 text-lg">Создайте комнату и пригласите друзей одной ссылкой — не требуется регистрация для гостей!</p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="bg-[#181828] rounded-2xl shadow-lg w-[510px] h-[285px] md:w-[630px] md:h-[360px] flex items-center justify-center">
                <span className="text-gray-500 text-base select-none">Промо-видео скоро</span>
              </div>
            </div>
          </div>
          {/* Feature 3 */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between py-12 px-4 md:px-24
          rounded-2xl shadow-2xl">
            <div className="w-full md:w-1/2 flex flex-col items-start mb-8 md:mb-0">
              <span className="mb-4 text-4xl">🕒</span>
              <h4 className="text-white text-2xl font-semibold mb-2">Синхронный просмотр</h4>
              <p className="text-gray-300 text-lg">Видео у всех участников всегда идёт синхронно — никто не отстаёт и не опережает, даже если кто-то ставит на паузу.</p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="bg-[#232346] rounded-2xl shadow-lg w-[510px] h-[285px] md:w-[630px] md:h-[360px] flex items-center justify-center">
                <span className="text-gray-500 text-base select-none">Промо-видео скоро</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <footer className="w-full bg-[#070710] border-t border-[#181828] py-8 mt-8 flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl px-6">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} WatchTogether. Все права защищены.
          </div>
          <div className="flex items-center space-x-6">
            <a href="mailto:contact@watchtogether.com" className="text-gray-400 hover:text-white text-sm">contact@watchtogether.com</a>
            <a href="https://t.me/yourtelegram" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Telegram</a>
            <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">GitHub</a>
            {/* Добавьте другие соцсети или контакты по желанию */}
          </div>
        </div>
      </footer>
    </div>
  )
} 