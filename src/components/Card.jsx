// src/components/Card.jsx
function Card({ className = '', children }) {
    return (
      <div
        className={`rounded-lg flex items-center justify-center ${className}`}
      >
        {children}
      </div>
    )
  }
  
  export default Card