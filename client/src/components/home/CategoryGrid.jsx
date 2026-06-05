import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import * as Icons from 'lucide-react'; // Import all icons to map dynamically

const CategorySlider = () => {
  return (
    <section className="category-slider-wrapper">
      <div className="container">
        <div className="category-slider hide-scrollbar">
          {CATEGORIES.map((category) => {
            const IconComponent = Icons[category.iconName];
            return (
              <article key={category.id} className="category-item">
                <div className="category-icon-wrapper">
                  {IconComponent && <IconComponent size={24} strokeWidth={1.5} />}
                </div>
                <span className="category-label">{category.label}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
