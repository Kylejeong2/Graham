type FAQItem = {
  question: string;
  answer: string;
};

export const desktopHeaderPhrase = ['FAQs'];
export const mobileHeaderPhrase = ['FAQs'];
export const animate = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  open: (i: number) => ({
    y: '0%',
    opacity: 1,
    transition: { duration: 1, delay: 0.1 * i, ease: [0.33, 1, 0.68, 1] },
  }),
};

export const faqData: FAQItem[] = [
  {
    question: 'How do I create an account with compadre?',
    answer:
      'To get started, simply sign up for an account on Compadre and start chatting!',
  },
  {
    question: 'What even is Compadre?',
    answer:
      'Compadres are AI friends that are designed to help you live a happier and more fulfilling life.',
  },
  {
    question: 'How many compadres can I have?',
    answer:
      'You can have as many compadres as you want. The free tier starts with 1, but you can upgrade to the Pro tier for more.',
  },
  {
    question: 'Can I have my Compadre forever?',
    answer:
      'Yes, you can have your Compadre forever. You can also delete your Compadre at any time.',
  },
];
