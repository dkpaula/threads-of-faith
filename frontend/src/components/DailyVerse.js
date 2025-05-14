import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

const DailyVerse = () => {
  const [verse, setVerse] = useState({
    text: '',
    reference: ''
  });

  // Array of inspiring Bible verses
  const verses = [
    { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16" },
    { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
    { text: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
    { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" }
  ];

  useEffect(() => {
    // Get today's date to ensure the same verse shows all day
    const today = new Date().toDateString();
    
    // Use the date to select a verse (this ensures the same verse shows all day)
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % verses.length;
    setVerse(verses[index]);
  }, []);

  return (
    <Card className="verse-of-day mb-4">
      <div className="verse-decoration"></div>
      <Card.Body className="text-center p-4">
        <div className="verse-icon mb-3">
          <i className="bi bi-book"></i>
        </div>
        <h3 className="h5 text-accent mb-3">Verse of the Day</h3>
        <div className="verse-content">
          <p className="lead mb-3 text-primary-dark">"{verse.text}"</p>
          <p className="verse-reference mb-0">— {verse.reference}</p>
        </div>
      </Card.Body>
      <style jsx>{`
        .verse-of-day {
          border: none;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, #ffffff, #fcfafa);
          box-shadow: 0 4px 20px rgba(139, 38, 53, 0.05);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: verseAppear 0.6s ease-out forwards;
        }

        @keyframes verseAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .verse-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8B2635, #d4af37);
          transform-origin: left;
          animation: decorationWidth 0.6s ease-out forwards;
        }

        @keyframes decorationWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .verse-of-day:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(139, 38, 53, 0.1);
        }

        .verse-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto;
          background: linear-gradient(45deg, #8B2635, #a93545);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.75rem;
          box-shadow: 0 4px 15px rgba(139, 38, 53, 0.2);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .verse-icon::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: 0.5s;
        }

        .verse-of-day:hover .verse-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 25px rgba(139, 38, 53, 0.25);
        }

        .verse-of-day:hover .verse-icon::before {
          left: 100%;
        }

        .verse-content {
          position: relative;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 1rem;
          margin: 1.5rem -0.5rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .verse-of-day:hover .verse-content {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.9);
        }

        .verse-content::before,
        .verse-content::after {
          content: '"';
          position: absolute;
          font-size: 5rem;
          color: #8B2635;
          opacity: 0.1;
          font-family: Georgia, serif;
          line-height: 1;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .verse-content::before {
          top: -1rem;
          left: 0.5rem;
        }

        .verse-content::after {
          bottom: -2.5rem;
          right: 0.5rem;
          transform: rotate(180deg);
        }

        .verse-of-day:hover .verse-content::before {
          transform: translateY(-5px) scale(1.1);
          opacity: 0.15;
        }

        .verse-of-day:hover .verse-content::after {
          transform: rotate(180deg) translateY(-5px) scale(1.1);
          opacity: 0.15;
        }

        .text-accent {
          color: #8B2635;
          font-weight: 600;
          letter-spacing: 0.5px;
          position: relative;
          display: inline-block;
        }

        .text-accent::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #8B2635, #d4af37);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .verse-of-day:hover .text-accent::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .text-primary-dark {
          color: #2c3e50;
          font-size: 1.2rem;
          line-height: 1.8;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .verse-of-day:hover .text-primary-dark {
          color: #1a202c;
        }

        .verse-reference {
          color: #d4af37;
          font-weight: 600;
          font-size: 1.2rem;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .verse-of-day:hover .verse-reference {
          transform: translateY(-2px);
          text-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
        }

        :global(.card-body) {
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(252,250,250,0.95));
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .verse-of-day:hover :global(.card-body) {
          background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(252,250,250,0.98));
        }
      `}</style>
    </Card>
  );
};

export default DailyVerse; 