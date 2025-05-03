
import React from 'react';

const testimonials = [
  {
    quote: "I was able to save £35 on my monthly subscriptions and found someone to share a Costco membership with. Total game changer!",
    author: "Alex T.",
    role: "Student, University of Manchester"
  },
  {
    quote: "The AI recommendations helped me switch energy providers and save over £200 a year. Plus the referral system is genius!",
    author: "Sarah L.",
    role: "Graduate Student, UCL"
  },
  {
    quote: "I love being able to share my Pret subscription when I'm not using it, and borrowing others' Clubcards. We all save together.",
    author: "James K.",
    role: "Student, University of Edinburgh"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't take our word for it. Hear from students who are already saving with Referlut.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative"
            >
              <div className="absolute -top-3 -left-3 h-10 w-10 bg-referlut-light-purple rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 11L8 13H5C4.44772 13 4 12.5523 4 12V7C4 6.44772 4.44772 6 5 6H9C9.55228 6 10 6.44772 10 7V11ZM20 11L18 13H15C14.4477 13 14 12.5523 14 12V7C14 6.44772 14.4477 6 15 6H19C19.5523 6 20 6.44772 20 7V11Z" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <blockquote className="italic text-gray-600 mb-6 pt-4">"{testimonial.quote}"</blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-referlut-blue/30 flex items-center justify-center font-semibold text-referlut-purple">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
