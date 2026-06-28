import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineStar, HiOutlineLocationMarker } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';

const listings = [
  { type: 'Hotel', name: 'Grand Palace Hotel', rating: '4.5', detail: '₹2500/night', location: 'North Goa', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80' },
  { type: 'Hotel', name: 'Lakeview Suites', rating: '4.4', detail: '₹3200/night', location: 'Udaipur', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80' },
  { type: 'Hotel', name: 'Royal Orchid Resort', rating: '4.6', detail: '₹4100/night', location: 'Manali', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80' },
  { type: 'Hotel', name: 'Seabreeze Beach Hotel', rating: '4.3', detail: '₹2800/night', location: 'Kerala', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80' },
  { type: 'Hotel', name: 'Mountain Crest Inn', rating: '4.2', detail: '₹2100/night', location: 'Shimla', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=700&q=80' },
  { type: 'Hotel', name: 'The Heritage Grand', rating: '4.7', detail: '₹5200/night', location: 'Jaipur', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=700&q=80' },
  { type: 'Restaurant', name: 'Spice Garden', rating: '4.3', detail: 'North Indian', location: 'Pune', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80' },
  { type: 'Restaurant', name: 'Urban Tandoor', rating: '4.2', detail: 'Multi-Cuisine', location: 'Mumbai', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80' },
];

const listingTypeStyle = {
  Hotel: { bg: 'rgba(181,167,118,0.2)', text: '#dfcf9f' },
  Restaurant: { bg: 'rgba(94,128,176,0.2)', text: '#b7d6ff' },
};

const goldButton = {
  border: '1px solid #d2c495',
  background: 'linear-gradient(90deg, #b5a776, #958657)',
  color: '#fdfbf5',
  borderRadius: 999,
  padding: '0.6rem 1.3rem',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
};

const filters = ['All', 'Hotel', 'Restaurant'];

export default function Listings() {
  const { isAuthenticated, user } = useAuthStore();
  const [filter, setFilter] = useState('All');
  const loggedInHome = user?.role ? '/home' : '/login';

  const visible = useMemo(
    () => (filter === 'All' ? listings : listings.filter((l) => l.type === filter)),
    [filter]
  );

  const bookTarget = (item) => {
    if (!isAuthenticated) return '/login';
    return item.type === 'Hotel' ? '/customer/book-room' : '/customer';
  };

  return (
    <main style={{ minHeight: '100vh', background: '#091013', color: '#f4f5ef' }}>
      <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <Link to="/" style={{ ...goldButton, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.3)', color: '#f4f5ef', boxShadow: 'none' }}>
            <HiOutlineArrowLeft /> Back Home
          </Link>
          <Link to={isAuthenticated ? loggedInHome : '/register'} style={goldButton}>
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </Link>
        </div>

        <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d8c69b', marginBottom: 10 }}>ALL LISTINGS</p>
        <h1 className="font-bold" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)', lineHeight: 1.07, marginBottom: 10 }}>
          Hotels &amp; Restaurants
        </h1>
        <p className="text-muted" style={{ marginBottom: 22, maxWidth: 560 }}>
          Browse our full collection of verified stays and top-rated dining spots.
        </p>

        <div className="flex gap-sm" style={{ marginBottom: 26, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                borderRadius: 999,
                padding: '0.5rem 1.15rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                border: filter === f ? '1px solid #d2c495' : '1px solid rgba(255,255,255,0.18)',
                background: filter === f ? 'linear-gradient(90deg, #b5a776, #958657)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#fdfbf5' : '#c2cbc6',
              }}
            >
              {f === 'All' ? 'All' : `${f}s`}
            </button>
          ))}
        </div>

        <div className="grid grid-3 gap-lg listings-grid">
          {visible.map((item) => (
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
              <div style={{ padding: '1.05rem 1.1rem 1.2rem' }}>
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
                <h3 className="font-bold" style={{ marginBottom: 6, fontSize: '1.16rem' }}>{item.name}</h3>
                <p className="text-sm" style={{ color: '#c2cbc6', marginBottom: 4 }}>
                  <HiOutlineStar style={{ color: '#e9bf47', display: 'inline', marginRight: 4 }} /> {item.rating} - {item.detail}
                </p>
                <p className="text-sm" style={{ color: '#8a9690', marginBottom: 14 }}>
                  <HiOutlineLocationMarker style={{ display: 'inline', marginRight: 4 }} /> {item.location}
                </p>
                <Link to={bookTarget(item)} style={{ ...goldButton, padding: '0.5rem 1.1rem', fontSize: '0.82rem' }}>
                  {item.type === 'Hotel' ? 'Book Now' : 'Order Food'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .listings-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .listings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
