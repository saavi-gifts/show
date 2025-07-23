-- Create gifts table for PlanetScale
CREATE TABLE gifts (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  dimensions JSON,
  materials JSON,
  colors JSON,
  occasions JSON,
  tags JSON,
  images JSON,
  artisan_info JSON,
  customization_options JSON,
  sustainability_info JSON,
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_subcategory (subcategory),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
);