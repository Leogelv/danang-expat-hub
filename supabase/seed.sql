-- =============================================
-- DANANG EXPAT HUB - SEED DATA
-- Тестовые данные для разработки
-- =============================================

-- =============================================
-- TG_USERS - Тестовые пользователи
-- =============================================
INSERT INTO public.tg_users (telegram_id, username, first_name, last_name, photo_url, timezone) VALUES
  (123456789, 'digital_nomad_alex', 'Alex', 'Johnson', 'https://randomuser.me/api/portraits/men/1.jpg', 'Asia/Ho_Chi_Minh'),
  (234567890, 'remote_sarah', 'Sarah', 'Miller', 'https://randomuser.me/api/portraits/women/2.jpg', 'Asia/Ho_Chi_Minh'),
  (345678901, 'dev_marcus', 'Marcus', 'Chen', 'https://randomuser.me/api/portraits/men/3.jpg', 'Asia/Ho_Chi_Minh'),
  (456789012, 'yoga_lena', 'Lena', 'Schmidt', 'https://randomuser.me/api/portraits/women/4.jpg', 'Europe/Berlin'),
  (567890123, 'founder_mike', 'Mike', 'Roberts', 'https://randomuser.me/api/portraits/men/5.jpg', 'America/New_York'),
  (678901234, 'designer_anna', 'Anna', 'Kowalski', 'https://randomuser.me/api/portraits/women/6.jpg', 'Asia/Ho_Chi_Minh'),
  (789012345, 'crypto_dan', 'Dan', 'Williams', 'https://randomuser.me/api/portraits/men/7.jpg', 'Asia/Singapore'),
  (890123456, 'writer_emma', 'Emma', 'Taylor', 'https://randomuser.me/api/portraits/women/8.jpg', 'Asia/Ho_Chi_Minh'),
  (901234567, 'surfer_tom', 'Tom', 'Anderson', 'https://randomuser.me/api/portraits/men/9.jpg', 'Australia/Sydney'),
  (112233445, 'marketing_julia', 'Julia', 'Martinez', 'https://randomuser.me/api/portraits/women/10.jpg', 'Asia/Ho_Chi_Minh');

-- =============================================
-- LISTINGS - Жильё и байки
-- =============================================
INSERT INTO public.listings (category, title, description, price, currency, location, amenities, contact, contact_type, images, lat, lng) VALUES
  -- Housing - An Thuong Area
  ('housing', 'An Thuong Studio with Pool', 'Bright studio for 3-6 months, quiet street, 5 min to beach. Perfect for digital nomads. Building has gym and rooftop bar.', 420, 'USD', 'An Thuong', ARRAY['pool', 'wifi', 'kitchen', 'gym', 'rooftop'], '@danang_host', 'telegram', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], 16.0478, 108.2401),
  ('housing', 'Modern An Thuong Flat', 'Fully furnished 1BR with fast fiber internet. Walking distance to all cafes and restaurants. Monthly cleaning included.', 480, 'USD', 'An Thuong', ARRAY['wifi', 'kitchen', 'cleaning', 'balcony'], '@anthung_apts', 'telegram', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], 16.0495, 108.2385),
  ('housing', 'Cozy Studio Near Beach', 'Small but cozy studio, 2 min walk to My Khe beach. Great for solo travelers. AC, hot water, fast wifi.', 320, 'USD', 'An Thuong', ARRAY['wifi', 'ac', 'hot_water'], '@beach_living', 'telegram', ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'], 16.0512, 108.2435),

  -- Housing - My Khe Area
  ('housing', 'My Khe 1BR Near Beach', 'One-bedroom apartment with balcony and fast WiFi. Ocean view from bedroom. Building has 24/7 security.', 520, 'USD', 'My Khe', ARRAY['wifi', 'balcony', 'ocean_view', 'security'], '@mykhe_living', 'telegram', ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], 16.0580, 108.2475),
  ('housing', 'Luxury My Khe Apartment', 'High-end 2BR apartment with stunning beach view. Premium building with pool, gym, and concierge. Perfect for couples or small families.', 1200, 'USD', 'My Khe', ARRAY['pool', 'gym', 'concierge', 'ocean_view', 'parking'], '@luxury_dn', 'whatsapp', ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], 16.0605, 108.2490),
  ('housing', 'My Khe Studio - Budget Friendly', 'Clean and simple studio perfect for budget-conscious nomads. 5 min to beach, quiet neighborhood.', 280, 'USD', 'My Khe', ARRAY['wifi', 'ac', 'kitchen'], '@budget_dn', 'telegram', ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], 16.0562, 108.2460),

  -- Housing - Ngu Hanh Son
  ('housing', 'Ngu Hanh Son Villa 2BR', 'Small villa with garden, ideal for long stays. Quiet area near Marble Mountains. Has motorbike parking.', 680, 'USD', 'Ngu Hanh Son', ARRAY['garden', 'parking', 'kitchen', 'quiet'], '@villa_owner', 'whatsapp', ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], 16.0255, 108.2580),
  ('housing', 'Garden House with Pool', 'Private house with tropical garden and small pool. Perfect for remote workers who need space and quiet.', 850, 'USD', 'Ngu Hanh Son', ARRAY['pool', 'garden', 'parking', 'office_space'], '@garden_house', 'telegram', ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'], 16.0290, 108.2555),

  -- Housing - Son Tra
  ('housing', 'Son Tra Mountain View', 'Unique apartment with view of Son Tra peninsula. Close to nature, 15 min to beach by bike.', 450, 'USD', 'Son Tra', ARRAY['mountain_view', 'parking', 'wifi', 'quiet'], '@sontra_apt', 'telegram', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], 16.1050, 108.2780),
  ('housing', 'Beachfront Son Tra', 'Right on the beach! Wake up to waves. Small but perfect location. Ideal for surfers.', 550, 'USD', 'Son Tra', ARRAY['beachfront', 'wifi', 'surfboard_storage'], '@beachfront_dn', 'telegram', ARRAY['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'], 16.1020, 108.2750),

  -- Housing - Hai Chau (City Center)
  ('housing', 'City Center Serviced Apartment', 'Modern serviced apartment in heart of Danang. Daily cleaning, 24/7 reception. Close to Dragon Bridge.', 650, 'USD', 'Hai Chau', ARRAY['serviced', 'cleaning', 'reception', 'central'], '@city_apts', 'telegram', ARRAY['https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800'], 16.0610, 108.2240),
  ('housing', 'Han River View Flat', 'Beautiful flat overlooking Han River. See Dragon Bridge fire show from your balcony!', 580, 'USD', 'Hai Chau', ARRAY['river_view', 'balcony', 'central', 'wifi'], '@hanriver_view', 'telegram', ARRAY['https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800'], 16.0635, 108.2210),

  -- Bikes
  ('bike', 'Honda Air Blade 125cc', 'Automatic bike, monthly rental, includes helmet. Well maintained, new tires. Delivery available.', 90, 'USD', 'An Thuong', ARRAY['helmet', 'delivery', 'insurance'], '@bikehub_dn', 'telegram', ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'], 16.0488, 108.2410),
  ('bike', 'Yamaha Janus 125cc', 'Comfortable scooter, weekly or monthly rental. Great for city driving. Pink/white color.', 70, 'USD', 'Son Tra', ARRAY['helmet', 'phone_holder'], '@janus_rent', 'telegram', ARRAY['https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800'], 16.1035, 108.2760),
  ('bike', 'Honda SH 150i Premium', 'Premium scooter for those who want comfort. ABS, smart key, lots of storage. Monthly only.', 150, 'USD', 'My Khe', ARRAY['abs', 'smart_key', 'storage', 'helmet'], '@premium_bikes', 'telegram', ARRAY['https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800'], 16.0590, 108.2465),
  ('bike', 'Yamaha NVX 155cc', 'Sporty automatic bike. Fast and fun. Good for longer trips to Hoi An or Hue.', 100, 'USD', 'Hai Chau', ARRAY['helmet', 'insurance', 'roadside_assist'], '@nvx_rental', 'telegram', ARRAY['https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800'], 16.0620, 108.2225),
  ('bike', 'Honda Vision 110cc', 'Economical and reliable. Perfect for daily commute. Cheapest rental in town.', 55, 'USD', 'An Thuong', ARRAY['helmet', 'delivery'], '@budget_bikes', 'telegram', ARRAY['https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800'], 16.0500, 108.2420),
  ('bike', 'Honda Winner X 150cc', 'Manual transmission sport bike. For experienced riders who want power.', 120, 'USD', 'Son Tra', ARRAY['helmet', 'gloves', 'insurance'], '@sport_bikes_dn', 'telegram', ARRAY['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'], 16.1060, 108.2800);

-- =============================================
-- MARKET_ITEMS - Барахолка
-- =============================================
INSERT INTO public.market_items (title, description, price, currency, category, condition, contact, images) VALUES
  -- Electronics
  ('Samsung 27 inch Monitor', 'Full HD monitor, good for remote work. Used for 6 months. No dead pixels. Includes cable.', 140, 'USD', 'Electronics', 'Used', '@danang_market', ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800']),
  ('MacBook Pro M1 2021', 'Selling my MacBook Pro 14". Mint condition. 512GB SSD, 16GB RAM. Includes original charger.', 1400, 'USD', 'Electronics', 'Like new', '@mac_seller', ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800']),
  ('Sony WH-1000XM4 Headphones', 'Best noise cancelling headphones. Perfect for cafes and coworking. Includes case.', 180, 'USD', 'Electronics', 'Used', '@audio_gear', ARRAY['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800']),
  ('iPad Pro 11" + Apple Pencil', 'Great for designers and note-taking. 256GB WiFi model. Screen protector installed.', 650, 'USD', 'Electronics', 'Used', '@ipad_dn', ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800']),
  ('Logitech MX Master 3', 'Best mouse for productivity. Barely used. Works on any surface.', 70, 'USD', 'Electronics', 'Like new', '@tech_stuff', ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800']),
  ('Portable Power Station 500W', 'Great for beach trips or power outages. Charges laptops and phones.', 200, 'USD', 'Electronics', 'Used', '@power_dn', ARRAY['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800']),

  -- Furniture
  ('Standing Desk', 'Adjustable desk, fits 120cm tabletop. Electric motor. Great for healthy work habits.', 120, 'USD', 'Furniture', 'Like new', '@expat_furnish', ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800']),
  ('Herman Miller Chair (Replica)', 'Ergonomic office chair. Not original but very comfortable. Mesh back.', 180, 'USD', 'Furniture', 'Used', '@chair_dn', ARRAY['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800']),
  ('IKEA Desk Lamp', 'LED desk lamp with USB charging. Adjustable brightness.', 25, 'USD', 'Furniture', 'Like new', '@ikea_stuff', ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800']),
  ('Bookshelf 5-tier', 'Simple wooden bookshelf. Good condition. Easy to disassemble.', 35, 'USD', 'Furniture', 'Used', '@moving_out', ARRAY['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800']),

  -- Sports
  ('Surfboard 6.2 ft', 'Great for beginners, leash included. Some scratches but floats perfectly.', 180, 'USD', 'Sports', 'Used', '@surf_dn', ARRAY['https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=800']),
  ('Yoga Mat Premium', 'Thick yoga mat, non-slip. Perfect for beach yoga. Purple color.', 30, 'USD', 'Sports', 'Like new', '@yoga_gear', ARRAY['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800']),
  ('Snorkeling Set', 'Mask, snorkel, and fins. Used once in Cham Islands. Size L fins.', 45, 'USD', 'Sports', 'Like new', '@beach_gear', ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800']),
  ('Dumbbells Set 20kg', 'Adjustable dumbbells for home workout. Includes stand.', 80, 'USD', 'Sports', 'Used', '@home_gym', ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800']),
  ('Electric Skateboard', 'Boosted Board Mini. Range 12km. Fun way to explore the city!', 400, 'USD', 'Sports', 'Used', '@ride_dn', ARRAY['https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800']),

  -- Clothing
  ('North Face Backpack 40L', 'Perfect travel backpack. Many compartments. Laptop sleeve.', 85, 'USD', 'Clothing', 'Used', '@travel_gear', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800']),
  ('Running Shoes Nike Size 42', 'Nike Pegasus 39. Used for 3 months. Still in good shape.', 55, 'USD', 'Clothing', 'Used', '@runner_dn', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800']),

  -- Books & Learning
  ('Vietnamese Language Books', 'Set of 3 books for learning Vietnamese. From beginner to intermediate.', 25, 'USD', 'Books', 'Used', '@learn_vn', ARRAY['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800']),
  ('Kindle Paperwhite', 'E-reader with backlight. Battery lasts weeks. 8GB storage.', 90, 'USD', 'Electronics', 'Used', '@reader_dn', ARRAY['https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=800']),

  -- Kitchen
  ('Coffee Maker Delonghi', 'Espresso machine with grinder. Makes great coffee. Leaving Danang.', 150, 'USD', 'Kitchen', 'Used', '@coffee_lover', ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800']),
  ('Rice Cooker Tiger', 'Japanese rice cooker. Makes perfect rice every time. 3L capacity.', 45, 'USD', 'Kitchen', 'Used', '@kitchen_dn', ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800']);

-- =============================================
-- PLACES - Кафе, рестораны, коворкинги
-- =============================================
INSERT INTO public.places (name, description, category, price_level, tags, wifi, vegan, address, contact, rating, images) VALUES
  -- Cafes - An Thuong
  ('Brewline Coffee Lab', 'Specialty coffee with quiet upstairs seating. Great for focused work. Excellent pour over.', 'Cafe', '$$', ARRAY['specialty', 'quiet', 'remote-work', 'pour-over'], true, true, 'An Thuong 5, Danang', '@brewline', 4.7, ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800']),
  ('The Espresso Station', 'Cozy corner cafe with strong wifi and power outlets at every table. Nomad favorite.', 'Cafe', '$$', ARRAY['cozy', 'power-outlets', 'nomad-friendly'], true, false, '42 An Thuong 4, Danang', '@espresso_st', 4.5, NULL),
  ('Cong Caphe', 'Famous Vietnamese chain with retro communist decor. Coconut coffee is a must-try.', 'Cafe', '$', ARRAY['vietnamese', 'instagram', 'coconut-coffee'], true, false, 'An Thuong 2, Danang', NULL, 4.3, NULL),
  ('Blossom Coffee', 'Garden cafe with outdoor seating. Great for morning work sessions.', 'Cafe', '$', ARRAY['garden', 'outdoor', 'peaceful'], true, true, 'An Thuong 7, Danang', '@blossom_dn', 4.4, NULL),

  -- Cafes - My Khe / Son Tra
  ('The Hideout', 'Hidden gem with ocean view. Perfect for sunset work sessions.', 'Cafe', '$$', ARRAY['ocean-view', 'sunset', 'hidden-gem'], true, false, 'My Khe Beach Road, Danang', '@hideout_dn', 4.6, NULL),
  ('Son Tra Coffee', 'Local cafe at foot of Son Tra mountain. Cheap and authentic.', 'Cafe', '$', ARRAY['local', 'authentic', 'cheap'], true, false, 'Son Tra District, Danang', NULL, 4.2, NULL),

  -- Coworking Spaces
  ('Oceanic Cowork', 'Coworking space with day passes and meeting rooms. Strong community. Weekly events.', 'Coworking', '$$', ARRAY['cowork', 'community', 'events', 'meeting-rooms'], true, false, 'My Khe 2, Danang', '@oceanic_cowork', 4.6, NULL),
  ('Toong Coworking', 'Professional coworking chain. Reliable internet, AC, free coffee. Day pass 150k VND.', 'Coworking', '$$$', ARRAY['professional', 'reliable', 'chain'], true, false, 'Hai Chau, Danang', '@toong_dn', 4.5, NULL),
  ('Nomad Station', 'Casual coworking focused on digital nomads. Chill vibe, standing desks available.', 'Coworking', '$$', ARRAY['nomad', 'casual', 'standing-desks'], true, false, 'An Thuong 4, Danang', '@nomad_station', 4.4, NULL),
  ('Dreamplex', 'Premium coworking with private offices. Great for teams and startups.', 'Coworking', '$$$', ARRAY['premium', 'private-offices', 'startup'], true, false, 'Nguyen Van Linh, Danang', '@dreamplex_dn', 4.7, NULL),

  -- Restaurants - Vietnamese
  ('Pho Garden', 'Local Vietnamese spot with English menu. Authentic pho and banh mi.', 'Restaurant', '$', ARRAY['local', 'budget', 'pho', 'vietnamese'], false, false, 'Hai Chau 1, Danang', '@phogarden', 4.3, NULL),
  ('Madam Lan', 'Central Vietnamese cuisine. Try the mi quang and bun cha ca. Always packed with locals.', 'Restaurant', '$', ARRAY['local', 'authentic', 'mi-quang'], false, false, 'Bach Dang, Danang', NULL, 4.6, NULL),
  ('Ba Duong Banh Xeo', 'Famous for banh xeo (crispy pancakes). Cash only. Queue during lunch.', 'Restaurant', '$', ARRAY['famous', 'banh-xeo', 'cash-only'], false, false, 'Hoang Dieu, Danang', NULL, 4.5, NULL),
  ('Com Ga A Hai', 'Best chicken rice in Danang. Simple but delicious. 35k VND per portion.', 'Restaurant', '$', ARRAY['chicken-rice', 'cheap', 'local'], false, false, 'Thai Phien, Danang', NULL, 4.7, NULL),

  -- Restaurants - Western & International
  ('Waterfront', 'Upscale restaurant on Han River. Great steaks and pasta. Date night spot.', 'Restaurant', '$$$', ARRAY['upscale', 'river-view', 'steaks', 'date-night'], true, false, 'Bach Dang, Danang', '@waterfront_dn', 4.4, NULL),
  ('Pizza 4Ps', 'Japanese pizza chain famous for cheese made in-house. Always busy, book ahead.', 'Restaurant', '$$', ARRAY['pizza', 'japanese', 'reservation'], true, true, 'My Khe, Danang', '@4ps_dn', 4.6, NULL),
  ('Fatfish', 'Western pub with burgers, wings, and craft beer. Expat hangout on weekends.', 'Restaurant', '$$', ARRAY['burgers', 'craft-beer', 'expat', 'pub'], true, false, 'An Thuong, Danang', '@fatfish_dn', 4.3, NULL),
  ('Luna Pub', 'Live music venue with good food. Best place for Friday night.', 'Restaurant', '$$', ARRAY['live-music', 'nightlife', 'drinks'], true, false, 'An Thuong, Danang', '@luna_dn', 4.2, NULL),

  -- Restaurants - Healthy & Vegan
  ('Loving Hut', 'Vegan Vietnamese and Western food. Clean and cheap. Great mock meat.', 'Restaurant', '$', ARRAY['vegan', 'healthy', 'mock-meat'], true, true, 'Hai Chau, Danang', NULL, 4.4, NULL),
  ('The Vegan Kitchen', 'Fully vegan cafe with smoothie bowls and salads. Instagram-worthy.', 'Restaurant', '$$', ARRAY['vegan', 'smoothie-bowls', 'instagram'], true, true, 'An Thuong, Danang', '@vegan_kitchen', 4.5, NULL),
  ('Hum Vegetarian', 'Upscale vegetarian Vietnamese. Beautiful presentation.', 'Restaurant', '$$', ARRAY['vegetarian', 'vietnamese', 'upscale'], true, true, 'Nguyen Van Linh, Danang', '@hum_dn', 4.6, NULL),

  -- Gyms & Fitness
  ('Fit24 Gym', 'Modern gym with good equipment. Day pass available. Open 24/7.', 'Gym', '$$', ARRAY['24-7', 'modern', 'day-pass'], false, false, 'Hai Chau, Danang', '@fit24_dn', 4.3, NULL),
  ('California Fitness', 'Premium gym chain with pool and classes. Expensive but worth it.', 'Gym', '$$$', ARRAY['pool', 'classes', 'premium'], false, false, 'My Khe, Danang', '@cali_dn', 4.4, NULL),
  ('Beach Yoga Danang', 'Sunrise yoga on My Khe beach. Drop-in classes 100k VND.', 'Fitness', '$', ARRAY['yoga', 'beach', 'sunrise'], false, false, 'My Khe Beach, Danang', '@beach_yoga_dn', 4.8, NULL),
  ('CrossFit Danang', 'Serious CrossFit box with certified coaches. Friendly community.', 'Gym', '$$', ARRAY['crossfit', 'community', 'coaches'], false, false, 'Son Tra, Danang', '@crossfit_dn', 4.5, NULL),

  -- Healthcare
  ('Family Medical Practice', 'International clinic with English-speaking doctors. Expensive but reliable.', 'Healthcare', '$$$', ARRAY['international', 'english', 'reliable'], false, false, 'Nguyen Van Linh, Danang', '@fmp_dn', 4.7, NULL),
  ('Vinmec Hospital', 'Modern private hospital. Emergency services 24/7. Accepts travel insurance.', 'Healthcare', '$$$', ARRAY['hospital', 'emergency', 'insurance'], false, false, 'Ngu Hanh Son, Danang', '@vinmec_dn', 4.6, NULL),
  ('Danang Dental', 'Affordable dental clinic with good reviews. English spoken.', 'Healthcare', '$$', ARRAY['dental', 'affordable', 'english'], false, false, 'Hai Chau, Danang', '@dental_dn', 4.4, NULL),

  -- Services
  ('Vietcombank', 'Best bank for foreigners. Easy to open account with passport and visa.', 'Services', '$', ARRAY['bank', 'foreigner-friendly'], false, false, 'Multiple locations, Danang', NULL, 4.0, NULL),
  ('Laundry Express', 'Same-day laundry service. 20k VND per kg. Free pickup over 5kg.', 'Services', '$', ARRAY['laundry', 'pickup', 'same-day'], false, false, 'An Thuong, Danang', '@laundry_dn', 4.5, NULL),
  ('VN Visa Extension', 'Reliable visa extension service. 3-month extension from $80.', 'Services', '$$', ARRAY['visa', 'extension', 'reliable'], false, false, 'Online service', '@visa_vn', 4.3, NULL);

-- =============================================
-- EVENTS - События и мероприятия
-- =============================================
INSERT INTO public.events (title, description, starts_at, location, category, max_participants, organizer_contact) VALUES
  -- Sports
  ('Beach Volleyball Meetup', 'Saturday morning game, all skill levels welcome. We have the net and ball. Just show up!', NOW() + INTERVAL '3 days', 'My Khe Beach (near Pullman)', 'Sport', 24, '@danang_volley'),
  ('Sunday Morning Run Club', 'Casual 5K run along the beach. Meet at Brewline at 6am. All paces welcome.', NOW() + INTERVAL '5 days', 'Brewline Coffee, An Thuong', 'Sport', 30, '@run_dn'),
  ('Sunrise Yoga Session', 'Free community yoga on the beach. Bring your own mat. Donations welcome.', NOW() + INTERVAL '2 days', 'My Khe Beach', 'Sport', 40, '@beach_yoga_dn'),
  ('Surfing Lesson for Beginners', 'Learn to surf! Board and instructor provided. 2 hour session.', NOW() + INTERVAL '4 days', 'My Khe Beach', 'Sport', 8, '@surf_dn'),
  ('Mountain Biking Son Tra', 'Explore Son Tra peninsula by bike. Intermediate level. Bring your own bike or rent.', NOW() + INTERVAL '6 days', 'Son Tra entrance', 'Sport', 12, '@bike_dn'),

  -- Networking
  ('Remote Builders Night', 'Casual meetup for founders and devs building remote products. Share what you are working on.', NOW() + INTERVAL '7 days', 'Toong Coworking', 'Networking', 40, '@builders_dn'),
  ('Expat Coffee Morning', 'Weekly coffee meetup for newcomers. Ask questions, make friends. Every Wednesday.', NOW() + INTERVAL '4 days', 'Espresso Station, An Thuong', 'Networking', 20, '@expat_dn'),
  ('Startup Pitch Night', 'Present your startup idea in 5 minutes. Get feedback from fellow entrepreneurs.', NOW() + INTERVAL '10 days', 'Dreamplex, Danang', 'Networking', 50, '@startup_dn'),
  ('Digital Nomad Dinner', 'Monthly dinner at a local restaurant. Great way to meet long-term residents.', NOW() + INTERVAL '14 days', 'Waterfront Restaurant', 'Networking', 25, '@nomads_dn'),
  ('Women in Tech Meetup', 'Networking event for women in tech. Talks, mentoring, connections.', NOW() + INTERVAL '9 days', 'Oceanic Cowork', 'Networking', 30, '@wit_dn'),

  -- Social
  ('Language Exchange Night', 'Practice Vietnamese with locals, help them with English. Fun and educational!', NOW() + INTERVAL '3 days', 'Luna Pub, An Thuong', 'Social', 40, '@language_dn'),
  ('Pub Quiz Thursday', 'Weekly trivia night at Fatfish. Form teams of 4-6. Prizes for winners!', NOW() + INTERVAL '5 days', 'Fatfish, An Thuong', 'Social', 60, '@quiz_dn'),
  ('Movie Night - Outdoor Cinema', 'Watching classic films on a projector by the beach. Bring snacks!', NOW() + INTERVAL '8 days', 'An Thuong Beach', 'Social', 50, '@cinema_dn'),
  ('Board Games Night', 'Bring your favorite board games or play ours. Settlers of Catan, Codenames, and more.', NOW() + INTERVAL '4 days', 'Nomad Station', 'Social', 20, '@games_dn'),
  ('Karaoke Night', 'Belt out your favorite songs! Private room booked. 50k VND entry.', NOW() + INTERVAL '6 days', 'K-Star Karaoke, Hai Chau', 'Social', 15, '@karaoke_dn'),

  -- Culture & Learning
  ('Vietnamese Cooking Class', 'Learn to make pho, banh mi, and spring rolls. Ingredients included.', NOW() + INTERVAL '5 days', 'The Vegan Kitchen', 'Culture', 10, '@cooking_dn'),
  ('Photography Walk', 'Explore hidden spots in Danang with your camera. Tips from local photographer.', NOW() + INTERVAL '7 days', 'Dragon Bridge', 'Culture', 15, '@photo_dn'),
  ('Meditation & Mindfulness', 'Weekly guided meditation session. Perfect for busy remote workers.', NOW() + INTERVAL '3 days', 'Beach Yoga Danang', 'Culture', 20, '@mindful_dn'),
  ('Vietnamese Language Basics', 'Free intro class for complete beginners. Learn essential phrases.', NOW() + INTERVAL '6 days', 'Toong Coworking', 'Culture', 20, '@learn_vn'),

  -- Trips & Adventures
  ('Hoi An Day Trip', 'Explore ancient town, tailor shops, and lanterns. Grab scooter or van.', NOW() + INTERVAL '11 days', 'Meet at An Thuong', 'Trip', 15, '@trips_dn'),
  ('Hai Van Pass Ride', 'Epic motorcycle ride over Hai Van Pass. Experienced riders only.', NOW() + INTERVAL '8 days', 'An Thuong gas station', 'Trip', 10, '@riders_dn'),
  ('Cham Islands Snorkeling', 'Full day trip to Cham Islands. Snorkeling, beach, seafood lunch.', NOW() + INTERVAL '13 days', 'Cua Dai port (need taxi)', 'Trip', 20, '@islands_dn'),
  ('Ba Na Hills Group Visit', 'Visit the famous Golden Bridge. Sharing taxi to save money.', NOW() + INTERVAL '9 days', 'Meeting point TBD', 'Trip', 12, '@bana_dn');

-- =============================================
-- COMMUNITY_POSTS - Посты сообщества
-- =============================================
INSERT INTO public.community_posts (title, body, author_name, tags, latitude, longitude, images) VALUES
  -- Questions (с геолокацией - места в Дананге)
  ('Looking for a yoga group', 'Anyone up for sunrise yoga near the beach? I usually go at 6am but would love company!', 'Lena', ARRAY['wellness', 'yoga', 'morning'], 16.0544, 108.2450, ARRAY['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800']),
  ('Best SIM card for expats?', 'What is the fastest 4G provider in Danang? Need reliable internet for work calls.', 'Mark', ARRAY['tips', 'connectivity', 'sim'], 16.0678, 108.2208, NULL),
  ('Motorbike license question', 'Can I drive with my international license? Or do I need a Vietnamese one? What is the process?', 'Tom', ARRAY['legal', 'motorbike', 'license'], NULL, NULL, NULL),
  ('Visa run recommendations?', 'My 3-month visa is expiring. Should I extend or do a visa run to Cambodia?', 'Sarah', ARRAY['visa', 'tips', 'legal'], NULL, NULL, NULL),
  ('Best area to live for families?', 'Moving to Danang with kids (5 and 8). Which neighborhood is best for international schools?', 'David', ARRAY['family', 'housing', 'schools'], 16.0400, 108.2100, NULL),

  -- Recommendations (с геолокацией)
  ('Hidden gem: Ba Duong Banh Xeo', 'Discovered this local spot for banh xeo. 25k VND for the best crispy pancake ever. Cash only, always a queue but worth it!', 'Anna', ARRAY['food', 'local', 'recommendation'], 16.0712, 108.2142, ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']),
  ('My favorite coworking setup', 'After trying all spaces in Danang, my routine: Brewline 7-11am (quiet), then Oceanic afternoon (community). Perfect combo!', 'Marcus', ARRAY['coworking', 'productivity', 'tips'], 16.0589, 108.2456, ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']),
  ('Motorbike mechanic recommendation', 'Found an honest mechanic near An Thuong market. Fixed my Air Blade for 100k when others quoted 500k. DM for address.', 'Dan', ARRAY['motorbike', 'services', 'recommendation'], 16.0612, 108.2389, NULL),

  -- Looking for (частично с геолокацией)
  ('Looking for tennis partner', 'Intermediate level, looking for someone to play 2-3x per week. Morning or evening works.', 'Mike', ARRAY['sport', 'tennis', 'looking-for'], 16.0480, 108.2350, NULL),
  ('Co-founder for SaaS project', 'Building a tool for remote teams. Need a frontend dev co-founder. Equity split negotiable.', 'Julia', ARRAY['startup', 'cofounder', 'tech'], NULL, NULL, NULL),
  ('Language exchange partner', 'Vietnamese intermediate, looking for native speaker to practice with. I can help with English!', 'Emma', ARRAY['language', 'vietnamese', 'exchange'], 16.0700, 108.2200, NULL),
  ('Surfing buddy needed', 'Beginner surfer, looking for someone to learn with. I have an extra board!', 'Tom', ARRAY['surfing', 'sport', 'buddy'], 16.0520, 108.2480, ARRAY['https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800']),

  -- Tips & Guides
  ('Ultimate Danang starter guide', 'After 2 years here, compiled my top tips: 1) Get a local SIM (Viettel), 2) Use Grab for taxis, 3) Join telegram groups, 4) Get a motorbike asap. Happy to answer questions!', 'Alex', ARRAY['guide', 'tips', 'newbie'], 16.0544, 108.2022, ARRAY['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800']),
  ('Where to exchange money', 'Best rates at gold shops on Phan Chau Trinh street. Better than banks. Bring clean USD bills.', 'Sarah', ARRAY['money', 'tips', 'exchange'], 16.0680, 108.2120, NULL),
  ('Rainy season survival tips', 'Rainy season Sept-Nov: 1) Always carry rain poncho, 2) Waterproof phone case, 3) Avoid beach during storms, 4) Indoor backup plans. Stay safe!', 'Marcus', ARRAY['weather', 'tips', 'safety'], NULL, NULL, NULL),

  -- Events feedback (с геолокацией событий)
  ('Great time at volleyball yesterday!', 'Thanks to everyone who came to beach volleyball. 16 people showed up! Same time next week?', 'Mike', ARRAY['event', 'volleyball', 'feedback'], 16.0510, 108.2465, ARRAY['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800']),
  ('Cooking class was amazing', 'Learned to make real pho from scratch. 3 hours well spent. Highly recommend Vietnamese cooking class!', 'Emma', ARRAY['event', 'cooking', 'feedback'], 16.0600, 108.2380, ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800']),

  -- Discussions
  ('Cost of living breakdown 2024', 'My monthly spend: Rent $450, Food $300, Bike $70, Cowork $100, Fun $200. Total ~$1100. Could do cheaper but I like comfort.', 'Dan', ARRAY['cost', 'budget', 'discussion'], NULL, NULL, NULL),
  ('Is Danang getting too expensive?', 'Rents up 30% from 2022. Some cafes now charge Saigon prices. Still cheaper than Bali but trend is concerning. Thoughts?', 'Julia', ARRAY['cost', 'discussion', 'trend'], NULL, NULL, NULL),
  ('Best time to visit Hoi An?', 'Weekday mornings are magical - no crowds, beautiful light for photos. Avoid weekends and full moon festival unless you like chaos!', 'Anna', ARRAY['hoian', 'tips', 'travel'], 15.8801, 108.3380, ARRAY['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800']);

-- =============================================
-- NOTIFICATIONS - Уведомления
-- =============================================
INSERT INTO public.notifications (tg_user_id, title, message, type, metadata, is_read)
SELECT
  tg_users.id,
  'Welcome to Danang Expat Hub',
  'Start with the AI assistant to get housing, bikes, and events in one chat. Ask anything!',
  'info',
  '{}'::jsonb,
  false
FROM public.tg_users
LIMIT 5;

INSERT INTO public.notifications (tg_user_id, title, message, type, metadata, is_read)
SELECT
  tg_users.id,
  'Weekend Volleyball',
  'Beach volleyball this Saturday at 10:00. Tap Events to RSVP!',
  'event',
  '{"priority":"high", "event_id": "beach-volleyball"}'::jsonb,
  false
FROM public.tg_users
LIMIT 3;

INSERT INTO public.notifications (tg_user_id, title, message, type, metadata, is_read)
SELECT
  tg_users.id,
  'New listings in your area',
  '3 new apartments listed in An Thuong this week. Check them out!',
  'listing',
  '{"count": 3, "area": "An Thuong"}'::jsonb,
  true
FROM public.tg_users
OFFSET 2 LIMIT 4;

INSERT INTO public.notifications (tg_user_id, title, message, type, metadata, is_read)
SELECT
  tg_users.id,
  'Remote Builders Meetup Tonight',
  'Join fellow founders and devs at Toong Coworking. 7pm start.',
  'event',
  '{"priority":"medium"}'::jsonb,
  false
FROM public.tg_users
OFFSET 4 LIMIT 3;
