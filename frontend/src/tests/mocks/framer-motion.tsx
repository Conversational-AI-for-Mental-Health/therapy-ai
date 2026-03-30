import React, { ReactNode } from 'react';

const motion = {
  div: (props: any) => React.createElement('div', props),
  form: (props: any) => React.createElement('form', props),
  button: (props: any) => React.createElement('button', props),
  aside: (props: any) => React.createElement('aside', props),
  span: (props: any) => React.createElement('span', props),
  section: (props: any) => React.createElement('section', props),
  article: (props: any) => React.createElement('article', props),
  nav: (props: any) => React.createElement('nav', props),
  header: (props: any) => React.createElement('header', props),
  footer: (props: any) => React.createElement('footer', props),
  main: (props: any) => React.createElement('main', props),
  p: (props: any) => React.createElement('p', props),
  h1: (props: any) => React.createElement('h1', props),
  h2: (props: any) => React.createElement('h2', props),
  h3: (props: any) => React.createElement('h3', props),
  a: (props: any) => React.createElement('a', props),
  ul: (props: any) => React.createElement('ul', props),
  li: (props: any) => React.createElement('li', props),
};

const AnimatePresence: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>{children}</>
);

export { motion, AnimatePresence };
