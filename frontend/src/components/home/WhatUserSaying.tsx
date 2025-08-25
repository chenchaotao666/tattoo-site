import React from 'react';

export interface TestimonialData {
  rating: number; // 1-5 stars
  review: string;
  user: {
    name: string;
    title: string;
    avatar: string;
  };
}

export interface WhatUserSayingData {
  title: string;
  subtitle: string;
  testimonials: TestimonialData[][];
}

interface WhatUserSayingProps {
  data: WhatUserSayingData;
}

const WhatUserSaying: React.FC<WhatUserSayingProps> = ({ data }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex justify-start items-start gap-1 overflow-hidden">
        {[...Array(rating)].map((_, index) => (
          <img 
            key={index}
            className="w-5 h-[18.89px]"
            src="/images/star.svg"
            alt="star"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-[1440px] h-[1161px]">
      {/* Title */}
      <div className="absolute left-[413px] top-0 text-center text-[#ECECEC] text-[46px] font-inter font-bold capitalize break-words">
        {data.title}
      </div>
      
      {/* Subtitle */}
      <div className="absolute w-[900px] left-[270px] top-[72px] text-center text-[#A5A5A5] text-lg font-inter font-normal break-words">
        {data.subtitle}
      </div>
      
      {/* Testimonial Columns */}
      {data.testimonials.map((column, columnIndex) => {
        const columnPositions = ['left-[135px]', 'left-[531px]', 'left-[929px]'];
        const columnWidths = ['w-[376px]', 'w-[377px]', 'w-[376px]'];
        
        return (
          <div key={columnIndex} className={`absolute ${columnWidths[columnIndex]} ${columnPositions[columnIndex]} top-[154px] flex flex-col justify-start items-start gap-5`}>
            {column.map((testimonial, index) => (
              <div key={index} className="self-stretch p-8 bg-[#19191F] rounded-2xl flex flex-col justify-start items-start gap-6">
                {/* Stars */}
                {renderStars(testimonial.rating)}
                
                {/* Content */}
                <div className="self-stretch flex flex-col justify-start items-start gap-6">
                  {/* Review Text */}
                  <div className="self-stretch text-[#C8C8C8] text-sm font-inter font-normal leading-5 break-words">
                    "{testimonial.review}"
                  </div>
                  
                  {/* User Info */}
                  <div className="flex justify-start items-center gap-3">
                    <img 
                      className="w-14 h-14 rounded-full" 
                      src={testimonial.user.avatar} 
                      alt={testimonial.user.name}
                    />
                    <div className="flex flex-col justify-start items-start gap-1.5">
                      <div className="text-[#ECECEC] text-sm font-inter font-medium break-words">
                        {testimonial.user.name}
                      </div>
                      <div className="text-[#A5A5A5] text-sm font-inter font-normal break-words">
                        {testimonial.user.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      
      {/* Gradient Overlay */}
      <div className="absolute w-[1440px] h-[300px] left-0 top-[861px] bg-gradient-to-b from-transparent to-[#030414]"></div>
    </div>
  );
};

// Example data for the component
export const sampleWhatUserSayingData: WhatUserSayingData = {
  title: "What Our Users Are Saying",
  subtitle: "Real stories from people using our AI Tattoo Generator from first-time ink to pro-level designs.",
  testimonials: [
    // Column 1
    [
      {
        rating: 5,
        review: "Never thought I'd get a full sleeve designed in one night. I typed in 'phoenix with cherry blossoms' and the AI gave me 8 totally different styles. Some felt too bold for my taste, but the last one? It captured the exact balance of elegance and power I was looking for. My tattoo artist even asked which studio did the draft.",
        user: {
          name: "Sophia Kim",
          title: "Tattoo Enthusiast",
          avatar: "/images/avatar/avatar1.png"
        }
      },
      {
        rating: 5,
        review: "As a designer, I mainly use it for brainstorming, but sometimes the AI surprises me with style combos I'd never think of—like biomechanical mixed with Art Nouveau. Those unexpected mixes often lead to my best work. It's not replacing creativity, but it gives you that push when your brain hits a wall.",
        user: {
          name: "Liam Davis",
          title: "Graphic Designer",
          avatar: "/images/avatar/avatar2.png"
        }
      },
      {
        rating: 4,
        review: "For a car brand's tech-themed campaign, the AI's electronic track matched the vibe perfectly. The client greenlit it on the spot and praised our 'cutting-edge creativity'—this tool is our secret weapon!",
        user: {
          name: "Isabella Kim",
          title: "Advertising Strategist",
          avatar: "/images/avatar/avatar3.png"
        }
      }
    ],
    // Column 2
    [
      {
        rating: 5,
        review: "I was really nervous about my first tattoo, so being able to see it on my arm before booking made all the difference. The realism is seriously crazy—my friends actually thought the AR preview was a real tattoo. It helped me fix the placement and size before I even stepped into the shop, which saved me a ton of second guessing.",
        user: {
          name: "Ethan Walker",
          title: "Photographer",
          avatar: "/images/avatar/avatar4.png"
        }
      },
      {
        rating: 4,
        review: "Used it to design a matching tattoo with my sister, and it turned into this fun little project we did together. We previewed it on our wrists with the AR tool and adjusted the size so it fit just right for both of us. The fact that we could finalize it without running back and forth to a shop made the whole experience stress-free.",
        user: {
          name: "Hannah Nguyen",
          title: "College Student",
          avatar: "/images/avatar/avatar5.png"
        }
      },
      {
        rating: 5,
        review: "My jazz arrangement homework got a radical upgrade when the AI generated improv riffs that taught me new chord progressions. It's like having a tutor who turns theory into playable art—way better than textbooks!",
        user: {
          name: "Miles Hernandez",
          title: "Music Student",
          avatar: "/images/avatar/avatar6.png"
        }
      }
    ],
    // Column 3
    [
      {
        rating: 4,
        review: "Needed a flash sheet for my studio, but I was short on time and inspiration. This tool whipped up 12 clean, varied designs in under 10 minutes. Not every one hit the mark, but even the ones I didn't choose gave me new ideas. For busy weeks, it's like having an extra set of hands in the shop.",
        user: {
          name: "Maria Lopez",
          title: "Tattoo Artist",
          avatar: "/images/avatar/avatar7.png"
        }
      },
      {
        rating: 5,
        review: "I'm really picky with designs, so I kept generating until I found the perfect one. Love that you can switch styles on the fly—went from a minimal line art to a bold watercolor version in seconds. It's almost addictive, because you keep thinking 'what if I try this variation…' and the results just keep getting better.",
        user: {
          name: "Jack Thompson",
          title: "Freelance Illustrator",
          avatar: "/images/avatar/avatar8.png"
        }
      },
      {
        rating: 5,
        review: "Fed up with repetitive playlists, I use this to generate unique Remixes that slay every gig. At my last warehouse party, the crowd begged for the tracks—now it's my go-to for hype-inducing beats!",
        user: {
          name: "Noah Garcia",
          title: "DJ",
          avatar: "/images/avatar/avatar9.png"
        }
      }
    ]
  ]
};

export default WhatUserSaying;