import React from 'react';
import { motion } from 'framer-motion';

const CategoryPills = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="py-12 px-[4%] text-center">
      <h2 className="text-white text-3xl font-bold mb-8">
        <span className="text-netflix-red">Explore</span> Categories
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category)}
            className={`px-8 py-2.5 rounded-full font-bold transition-all duration-300 border-2 ${
              activeCategory === category.id
                ? 'bg-netflix-red border-netflix-red text-white shadow-[0_0_20px_rgba(229,9,20,0.5)]'
                : 'bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white'
            } font-rajdhani text-lg tracking-wider`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPills;
