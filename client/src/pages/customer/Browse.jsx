import { HiOutlineArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function Browse() {
  return (
    <div className="animate-fade">
      <section style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
        <h1 className="font-display text-4xl mb-md">
          Welcome to <span style={{ color: 'var(--primary)' }}>Grand Paradise</span>
        </h1>
        <p className="text-lg text-muted mb-xl" style={{ maxWidth: 600, margin: '0 auto var(--space-xl)' }}>
          Experience the epitome of luxury and hospitality in the heart of the city.
        </p>

        <div className="flex justify-center gap-md flex-wrap">
          <Link to="/customer/book-room" className="btn btn-primary btn-lg">
            Book a Stay <HiOutlineArrowRight />
          </Link>
          <Link to="/customer/scan" className="btn btn-outline btn-lg">
            Scan QR
          </Link>
        </div>
      </section>
    </div>
  );
}
