import { useState, useCallback, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
    if(window.location.pathname!==next || window.location.search || window.location.hash)window.history.pushState({},'',next);
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
  // FormSubmit's normal multipart POST preserves image attachments and its
  // customer autoresponse, then redirects here instead of its own thank-you page.
  // No query parameter can prove inbox delivery; it signals the provider redirect.
  const search = new URLSearchParams(window.location.search);
  const quoteSent = route.page === 'configurator' && search.get('offerte') === 'verzonden';
  const quoteRef = search.get('referentie')?.slice(0, 40) ?? '';
  if (quoteSent) return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header onAdminClick={() => navigate('/beheer/')} onBackHome={goHome} />
      <main className="flex-1 flex items-center justify-center px-4 py-12" id="main-content">
        <div role="status" className="card w-full max-w-2xl p-8 sm:p-12 text-center space-y-5">
          <CheckCircle2 size={56} className="mx-auto text-[var(--accent)]" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Offerteaanvraag verstuurd</h1>
          <p className="text-[var(--text-secondary)]">Bedankt! Je aanvraag is verwerkt door onze formulierdienst. We nemen contact met je op om de mogelijkheden en de prijs te bespreken.</p>
          {quoteRef && <p className="text-sm text-[var(--text-secondary)]">Jouw referentie: <strong className="font-mono text-[var(--accent)]">{quoteRef}</strong></p>}
          <p className="text-xs text-[var(--text-muted)]">De foto en onderdelenlijst worden via FormSubmit doorgestuurd. Ontvangst in onze mailbox wordt apart gecontroleerd.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button type="button" onClick={goConfigurator} className="btn-primary">Terug naar configurator</button>
            <button type="button" onClick={goHome} className="btn-secondary">Naar de startpagina</button>
          </div>
        </div>
      </main>
    </div>
  );
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
