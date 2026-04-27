import { useState } from 'react';
import { HiOutlineSearch, HiOutlineStar, HiOutlineArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'rooms', label: 'Luxury Rooms', emoji: '🏨', desc: 'Stay in comfort and style' },
  { id: 'restaurant', label: 'Fine Dining', emoji: '🍽️', desc: 'Exquisite culinary experience' },
  { id: 'spa', label: 'Spa & Wellness', emoji: '💆', desc: 'Rejuvenate your soul' },
  { id: 'events', label: 'Events & Banquets', emoji: '🎊', desc: 'Host memorable celebrations' },
];

export default function Browse() {
  return (
    <div className="animate-fade">
      <section style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
        <h1 className="font-display text-4xl mb-md">Welcome to <span style={{ color: 'var(--primary)' }}>Grand Paradise</span></h1>
        <p className="text-lg text-muted mb-xl" style={{ maxWidth: 600, margin: '0 auto var(--space-xl)' }}>
          Experience the epitome of luxury and hospitality in the heart of the city.
        </p>
        
        <div className="flex justify-center gap-md">
          <Link to="/customer/book-room" className="btn btn-primary btn-lg">Book a Stay <HiOutlineArrowRight /></Link>
          <button className="btn btn-outline btn-lg">View Menu</button>
        </div>
      </section>

      <section className="grid grid-4 gap-lg mb-3xl">
        {categories.map(cat => (
          <div key={cat.id} className="card card-hover" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>{cat.emoji}</div>
            <h3 className="font-bold mb-xs">{cat.label}</h3>
            <p className="text-sm text-muted">{cat.desc}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex justify-between items-end mb-xl">
          <div>
            <h2 className="font-display text-2xl">Featured Rooms</h2>
            <p className="text-muted">Handpicked selection for your comfort</p>
          </div>
          <Link to="/customer/book-room" className="text-primary font-bold">View All Rooms</Link>
        </div>

        <div className="grid grid-3 gap-xl">
          {[
            { id: 1, name: 'Deluxe Ocean View', price: 6500, rating: 4.9, img: '🌊' },
            { id: 2, name: 'Executive Suite', price: 12000, rating: 5.0, img: '👑' },
            { id: 3, name: 'Standard Comfort', price: 3500, rating: 4.7, img: '🛏️' },
          ].map(room => (
            <div key={room.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 200, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>{room.img}</div>
              <div style={{ padding: 'var(--space-lg)' }}>
                <div className="flex justify-between items-center mb-sm">
                  <h3 className="font-bold text-lg">{room.name}</h3>
                  <div className="text-accent font-bold"><HiOutlineStar style={{ display: 'inline' }} /> {room.rating}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div><span className="text-xl font-bold">₹{room.price}</span> <span className="text-sm text-muted">/ night</span></div>
                  <button className="btn btn-primary btn-sm">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
