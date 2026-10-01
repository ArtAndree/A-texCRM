const paths = {
  home: 'M3 10 12 2l9 8v11h-6v-8H9v8H3Z',
  deals: 'M5 3h13a3 3 0 0 1 0 6H8l-5 4V5a2 2 0 0 1 2-2Zm3 11h11a2 2 0 0 1 2 2v6l-5-3H8a2.5 2.5 0 0 1 0-5Z',
  users: 'M16 21v-2c0-3-3-5-7-5s-7 2-7 5v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7a4 4 0 0 1 0 8m2 4c3 1 3 4 3 6',
  phone: 'M5 2 2 5c0 9 8 17 17 17l3-3-6-4-3 3c-3-1-6-4-7-7l3-3Z',
  mail: 'M2 4h20v16H2Zm0 1 10 8L22 5',
  bell: 'M4 18h16l-2-4V9a6 6 0 0 0-12 0v5Zm6 3h4',
  file: 'M5 2h9l5 5v15H5Zm9 0v6h5'
};
export default function Icon({ name, ...props }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.users} /></svg>;
}
