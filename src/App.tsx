import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import DetailingFlow from './components/DetailingFlow';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';
import { ConfiguratorInfo, NotFoundPage } from './components/RouteContent';
import { resolveRoute, sitePath } from './seo/routes';
import { applyMetadata } from './seo/metadata';

function App() {
  const [route,setRoute]=useState(()=>resolveRoute(window.location.pathname));
  const navigate=useCallback((path:string)=>{
    const next=sitePath(path);
    if(window.location.pathname!==next)window.history.pushState({},'',next);
    setRoute(resolveRoute(next));window.scrollTo(0,0);
  },[]);
  const goHome=useCallback(()=>navigate('/'),[navigate]);
  const goConfigurator=useCallback(()=>navigate('/configurator/'),[navigate]);
  useEffect(()=>{
    const pop=()=>setRoute(resolveRoute(window.location.pathname));
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
      const link=(event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if(!link || link.target || link.hasAttribute('download'))return;
      const url=new URL(link.href,window.location.href);
      if(url.origin!==location.origin || url.hash || url.search)return;
      const next=resolveRoute(url.pathname);if(next.page==='not-found')return;
      event.preventDefault();navigate(next.path);
    };
    window.addEventListener('popstate',pop);document.addEventListener('click',click);
    return()=>{window.removeEventListener('popstate',pop);document.removeEventListener('click',click);};
  },[navigate]);
  useEffect(()=>{
    applyMetadata(route);
    const path=sitePath(route.path);
    if(route.page!=='not-found' && window.location.pathname!==path)window.history.replaceState({},'',path+window.location.search+window.location.hash);
  },[route]);
  if(route.page==='admin')return <AdminPanel onClose={goConfigurator}/>;
  if(route.page==='not-found')return <NotFoundPage/>;
  if(route.page!=='configurator')return <HomePage page={route.page} onStart={goConfigurator}/>;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header onAdminClick={()=>navigate('/beheer/')} onBackHome={goHome}/>
      <main id="main-content" tabIndex={-1} className="flex-1"><DetailingFlow route={route} onNavigate={navigate}/><ConfiguratorInfo/></main>
    </div>
  );
}
export default App;
