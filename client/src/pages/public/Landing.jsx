import { Link } from 'react-router-dom';
import { HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineTruck, HiOutlineCollection, HiOutlineStar } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';

const exploreCards = [
  { icon: HiOutlineOfficeBuilding, title: 'Hotels', description: 'Comfortable stays at the best prices' },
  { icon: HiOutlineCollection, title: 'Restaurants', description: 'Order from top-rated places' },
  { icon: HiOutlineTruck, title: 'Room Service', description: 'Get food delivered to your room' },
];

const featuredListings = [
  { type: 'Hotel', name: 'Grand Palace Hotel', rating: '4.5', detail: '₹2500/night', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80' },
  { type: 'Restaurant', name: 'Spice Garden', rating: '4.3', detail: 'North Indian', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80' },
  { type: 'Hotel', name: 'Lakeview Suites', rating: '4.4', detail: '₹3200/night', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80' },
  { type: 'Restaurant', name: 'Urban Tandoor', rating: '4.2', detail: 'Multi-Cuisine', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80' },
];

const listingTypeStyle = {
  Hotel: { bg: 'rgba(181,167,118,0.2)', text: '#dfcf9f' },
  Restaurant: { bg: 'rgba(94,128,176,0.2)', text: '#b7d6ff' },
};

const foodHighlights = ['Quick ordering', 'Live order tracking', 'Multiple payment options'];
const stayHighlights = ['Verified hotels', 'Flexible booking', 'Best price deals'];

const quickFeatures = [
  { icon: HiOutlineOfficeBuilding, title: 'Premium Stays', description: 'Handpicked hotels with trusted ratings and transparent pricing.' },
  { icon: HiOutlineHome, title: 'Top Restaurants', description: 'Popular dining spots with cuisine filters and real guest reviews.' },
  { icon: HiOutlineTruck, title: 'Room Service', description: 'Fast in-room delivery and smooth service tracking from one app.' },
];

const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.66rem 1.45rem',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
};

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();
  const loggedInHome = user?.role ? '/home' : '/login';

  return (
    <main style={{ minHeight: '100vh', background: '#091013', color: '#f4f5ef' }}>
      <section
        style={{
          position: 'relative',
          minHeight: 760,
          backgroundImage: "linear-gradient(94deg, rgba(6, 8, 10, 0.92) 8%, rgba(7, 9, 10, 0.7) 58%, rgba(7, 9, 10, 0.42) 100%), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1700&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 14% 22%, rgba(231, 94, 12, 0.2), transparent 30%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <header
            className="flex items-center justify-between"
            style={{
              minHeight: 84,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(7, 10, 12, 0.5)',
              backdropFilter: 'blur(7px)',
            }}
          >
            <div className="flex items-center gap-sm">
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f7ad23', boxShadow: '0 0 14px rgba(247,173,35,0.8)' }} />
              <span className="font-bold text-lg">Grand Paradise</span>
            </div>
            <nav className="hide-mobile flex gap-lg text-sm" style={{ color: '#dce2dc' }}>
              <a href="#hero" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a>
              <a href="#explore" style={{ color: 'inherit', textDecoration: 'none' }}>Explore</a>
              <a href="#featured" style={{ color: 'inherit', textDecoration: 'none' }}>Featured</a>
              <a href="#food" style={{ color: 'inherit', textDecoration: 'none' }}>Food</a>
              <a href="#stay" style={{ color: 'inherit', textDecoration: 'none' }}>Stay</a>
            </nav>
            <Link to={isAuthenticated ? loggedInHome : '/register'} style={{ ...goldButton, fontSize: '0.8rem', padding: '0.55rem 1.15rem' }}>
              {isAuthenticated ? 'Dashboard' : 'Get Started'}
            </Link>
          </header>

          <div id="hero" className="grid gap-lg" style={{ gridTemplateColumns: '1.1fr 0.9fr', padding: '3.8rem 0 4.4rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#ddc998', marginBottom: 14 }}>ALL-IN-ONE HOSPITALITY EXPERIENCE</p>
              <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 4.1rem)', lineHeight: 1.02, marginBottom: 16, maxWidth: 720, fontWeight: 800 }}>
                Book Your Stay.
                <br />
                Order Your Meal.
                <br />
                All in One Place.
              </h1>
              <p style={{ color: '#d1d7d2', maxWidth: 610, fontSize: '1.03rem', marginBottom: 18 }}>
                Discover hotels, reserve rooms, and enjoy your favorite meals-anytime, anywhere.
              </p>
              <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
                <input className="input" placeholder="Search hotels / restaurants" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }} />
                <input className="input" placeholder="Location" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }} />
                <input className="input" placeholder="Check-in / Check-out" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }} />
              </div>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                <Link to={isAuthenticated ? loggedInHome : '/register'} style={goldButton}>Book Now</Link>
                <Link to="/customer" className="btn btn-outline" style={{ borderRadius: 999, padding: '0.66rem 1.45rem', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}>
                  Order Food
                </Link>
              </div>
            </div>

            <div style={{ position: 'relative', height: 470, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div
                style={{
                  width: 450,
                  maxWidth: '98%',
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  backgroundImage: "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 22px 42px rgba(0,0,0,0.45)',
                }}
              />
              <div style={{ position: 'absolute', right: 14, top: 85, width: 86, height: 86, borderRadius: '50%', border: '4px solid #ebefea', background: "url('https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80') center/cover", boxShadow: '0 8px 20px rgba(0,0,0,0.45)' }} />
              <div style={{ position: 'absolute', left: 12, bottom: 90, width: 86, height: 86, borderRadius: '50%', border: '4px solid #ebefea', background: "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80') center/cover", boxShadow: '0 8px 20px rgba(0,0,0,0.45)' }} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="explore"
        style={{
          background: 'linear-gradient(180deg, #060f12 0%, #071217 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '5.3rem 0 4.3rem',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 78% 24%, rgba(183,147,74,0.12), transparent 30%)', pointerEvents: 'none' }} />
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '0.85fr 1.15fr', gap: 46, alignItems: 'center', marginBottom: 38, position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative', width: 'fit-content', marginInline: 'auto' }}>
              <div style={{ width: 292, height: 384, borderRadius: 160, background: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80') center/cover", border: '1px solid rgba(255,255,255,0.24)', boxShadow: '0 18px 36px rgba(0,0,0,0.45)' }} />
              <div style={{ position: 'absolute', top: '32%', right: -18, background: '#b7ad88', color: '#f5f4ed', borderRadius: 10, padding: '12px 18px', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>our picks</div>
              <div style={{ position: 'absolute', left: -24, bottom: 18, width: 74, height: 74, borderRadius: '50%', border: '4px solid #eef2ed', background: "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=300&q=80') center/cover", boxShadow: '0 8px 18px rgba(0,0,0,0.4)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 12 }}>EXPLORE</p>
              <h2 className="font-bold" style={{ fontSize: 'clamp(2rem, 3.4vw, 3.2rem)', lineHeight: 1.05, marginBottom: 12 }}>
                Find What You&apos;re Looking For
              </h2>
              <p className="text-muted" style={{ maxWidth: 560, marginBottom: 18 }}>
                Everything you need for a perfect stay and dining experience.
              </p>
              <div className="grid grid-3 gap-md">
                {exploreCards.map((item) => (
                  <div
                    key={item.title}
                    className="card card-hover"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                      borderColor: 'rgba(255,255,255,0.1)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.28)',
                    }}
                  >
                    <div style={{ fontSize: '1.35rem', marginBottom: 8 }}><item.icon /></div>
                    <h3 className="font-semibold" style={{ marginBottom: 6, fontSize: '1.12rem' }}>{item.title}</h3>
                    <p className="text-sm text-muted" style={{ lineHeight: 1.55 }}>{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-sm" style={{ marginTop: 18, flexWrap: 'wrap' }}>
                <Link to="/customer" style={goldButton}>Explore Now</Link>
                <Link to={isAuthenticated ? loggedInHome : '/register'} className="btn btn-outline" style={{ borderRadius: 999, padding: '0.66rem 1.45rem', borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)' }}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-3 gap-lg" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, position: 'relative', zIndex: 1 }}>
            {quickFeatures.map((item) => (
              <article key={item.title} className="flex gap-sm items-start">
                <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: '#b5a978', flexShrink: 0, background: 'rgba(255,255,255,0.03)' }}>
                  <item.icon />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ marginBottom: 4 }}>{item.title}</h4>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="featured"
        className="container"
        style={{ padding: '4.5rem 1rem', position: 'relative' }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>FEATURED LISTINGS</p>
            {/* <h2 className="font-bold" style={{ fontSize: 'clamp(1.9rem, 3.3vw, 2.95rem)', lineHeight: 1.07 }}>Popular Near You</h2> */}
            <p className="text-muted" style={{ marginTop: 8 }}>
              Curated hotel and restaurant picks loved by guests near your location.
            </p>
          </div>
          <Link to="/customer" style={{ ...goldButton, padding: '0.7rem 1.55rem' }}>View All</Link>
        </div>
        <div className="grid grid-2 gap-lg">
          {featuredListings.map((item) => (
            <article
              key={item.name}
              className="card card-hover"
              style={{
                overflow: 'hidden',
                padding: 0,
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: '0 14px 26px rgba(0,0,0,0.25)',
              }}
            >
              <div
                style={{
                  height: 178,
                  background: `linear-gradient(0deg, rgba(6,8,10,0.28), rgba(6,8,10,0.28)), url('${item.image}') center/cover`,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <div style={{ padding: '1.05rem 1.1rem 1.15rem' }}>
                <span
                  className="badge"
                  style={{
                    marginBottom: 11,
                    background: listingTypeStyle[item.type].bg,
                    color: listingTypeStyle[item.type].text,
                    fontWeight: 700,
                  }}
                >
                  {item.type}
                </span>
                <h3 className="font-bold" style={{ marginBottom: 8, fontSize: '1.16rem' }}>{item.name}</h3>
                <p className="text-sm" style={{ color: '#c2cbc6' }}>
                  <HiOutlineStar style={{ color: '#e9bf47', display: 'inline', marginRight: 4 }} /> {item.rating} - {item.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="food"
        style={{
          background: 'linear-gradient(180deg, #0a1419 0%, #091219 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '4.4rem 0',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 18% 35%, rgba(183,147,74,0.15), transparent 36%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="card-glass"
            style={{
              maxWidth: 1040,
              marginRight: 'auto',
              borderColor: 'rgba(255,255,255,0.12)',
              background: 'linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            }}
          >
            <div className="grid" style={{ gridTemplateColumns: '1.1fr 0.9fr', gap: 28, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>ORDER FOOD EASILY</p>
                <h2 className="font-bold" style={{ fontSize: 'clamp(1.85rem, 3.3vw, 2.9rem)', lineHeight: 1.08, marginBottom: 12 }}>
                  Craving Something Delicious?
                </h2>
                <p className="text-muted" style={{ marginBottom: 16, fontSize: '1.02rem', maxWidth: 560 }}>
                  Browse menus, place orders, and track your food in real-time-whether you&apos;re at home or staying in a hotel.
                </p>

                <div className="grid grid-3 gap-sm" style={{ marginBottom: 18 }}>
                  {foodHighlights.map((text) => (
                    <div
                      key={text}
                      style={{
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 14,
                        padding: '0.62rem 0.78rem',
                        fontSize: '0.84rem',
                        color: '#d4dcd7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d6c189', flexShrink: 0 }} />
                      {text}
                    </div>
                  ))}
                </div>

                <Link to="/customer" style={goldButton}>Order Now</Link>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ height: 124, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: "linear-gradient(0deg, rgba(8,10,12,0.22), rgba(8,10,12,0.22)), url('https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=700&q=80') center/cover" }} />
                <div className="grid grid-2 gap-sm">
                  <div style={{ height: 92, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: "linear-gradient(0deg, rgba(8,10,12,0.22), rgba(8,10,12,0.22)), url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80') center/cover" }} />
                  <div style={{ height: 92, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: "linear-gradient(0deg, rgba(8,10,12,0.22), rgba(8,10,12,0.22)), url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80') center/cover" }} />
                </div>
                <div className="text-xs text-muted" style={{ textAlign: 'right' }}>Fresh picks, delivered fast.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="stay"
        className="container"
        style={{ padding: '4.2rem 1rem', position: 'relative' }}
      >
        <div
          className="card"
          style={{
            maxWidth: 1050,
            marginLeft: 'auto',
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'linear-gradient(130deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            overflow: 'hidden',
            padding: 0,
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: '0.95fr 1.05fr', alignItems: 'stretch' }}>
            <div style={{ minHeight: 360, background: "linear-gradient(0deg, rgba(8,10,12,0.32), rgba(8,10,12,0.32)), url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80') center/cover", position: 'relative' }}>
              <div style={{ position: 'absolute', left: 18, bottom: 18, display: 'grid', gap: 8 }}>
                <div style={{ background: 'rgba(8,12,14,0.72)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>Verified hotels</div>
                <div style={{ background: 'rgba(8,12,14,0.72)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>Instant confirmation</div>
              </div>
            </div>
            <div style={{ padding: '2rem 1.8rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>BOOK YOUR PERFECT STAY</p>
              <h2 className="font-bold" style={{ fontSize: 'clamp(1.8rem, 3.1vw, 2.75rem)', lineHeight: 1.1, marginBottom: 12 }}>
                Comfortable Stays, Just a Click Away
              </h2>
              <p className="text-muted" style={{ marginBottom: 16, maxWidth: 510 }}>
                Choose from a wide range of hotels based on your budget and preferences. Easy booking with instant confirmation.
              </p>
              <div className="grid grid-3 gap-sm" style={{ marginBottom: 18 }}>
                {stayHighlights.map((text) => (
                  <div key={text} style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '0.62rem 0.74rem', fontSize: '0.83rem', color: '#d4dcd7' }}>
                    {text}
                  </div>
                ))}
              </div>
              <Link to="/customer/book-room" style={goldButton}>Book a Room</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '0 1rem 5rem' }}>
        <div
          style={{
            maxWidth: 1040,
            marginRight: 'auto',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(210,196,149,0.28)',
            background: "linear-gradient(110deg, rgba(8,12,14,0.88), rgba(8,12,14,0.6)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80') center/cover",
            boxShadow: '0 18px 38px rgba(0,0,0,0.35)',
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: 20, padding: '2.4rem 2rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 8 }}>FINAL CTA</p>
              <h2 className="font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.05rem)', lineHeight: 1.08, marginBottom: 12 }}>
                Your Next Stay & Meal is Just a Tap Away
              </h2>
              <p className="text-muted" style={{ marginBottom: 18 }}>
                Start exploring hotels and restaurants near you.
              </p>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                <Link to="/customer" className="btn btn-outline" style={{ borderRadius: 999, padding: '0.66rem 1.45rem', borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)' }}>
                  Explore Now
                </Link>
                <Link to={isAuthenticated ? loggedInHome : '/register'} style={goldButton}>Get Started</Link>
              </div>
            </div>
            <div style={{ display: 'grid', alignItems: 'end', justifyItems: 'end' }}>
              <div style={{ background: 'rgba(183,147,74,0.2)', border: '1px solid rgba(210,196,149,0.35)', borderRadius: 16, padding: '0.85rem 1rem', maxWidth: 260 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>Book. Dine. Relax.</p>
                <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
                  One platform for stays, meals, and smooth travel experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

