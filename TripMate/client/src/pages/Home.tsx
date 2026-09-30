import { useState } from "react";
import SearchBox from "../components/SearchBox";
import type { Mode, Trip } from "../lib/api";

const images: Record<string, string> = {
  bus: "/tripmate-assets/bus.jpg",
  train: "/tripmate-assets/train.jpg",
  flight: "/tripmate-assets/flight.jpg",
  hotel: "/tripmate-assets/hotel.jpg",
  hero: "/tripmate-assets/home-hero.jpg",
};

const destinations = [
  {name:"Bengaluru",code:"BLR",category:"Cities",price:850,image:"https://images.unsplash.com/photo-1596176530529-78163a4f8902?w=900&auto=format&fit=crop&q=80",logo:"/tripmate-assets/bengaluru-logo.svg"},
  {name:"Hyderabad",code:"HYD",category:"Historic Sites",price:940,image:"https://images.unsplash.com/photo-1572445271230-a78b7c7d7c6f?w=900&auto=format&fit=crop&q=80",logo:"/tripmate-assets/hyderabad-logo.svg"},
  {name:"Goa",code:"GOI",category:"Beaches",price:1280,image:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop&q=80"},
  {name:"Manali",code:"MAN",category:"Mountains",price:1650,image:"https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=900&auto=format&fit=crop&q=80"},
  {name:"Mumbai",code:"BOM",category:"Cities",price:1100,image:"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&auto=format&fit=crop&q=80"},
  {name:"Delhi",code:"DEL",category:"Historic Sites",price:1200,image:"https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&auto=format&fit=crop&q=80"},
  {name:"Pune",code:"PNQ",category:"Cities",price:900,image:"https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=900&auto=format&fit=crop&q=80"},
  {name:"Varkala",code:"VAK",category:"Beaches",price:1400,image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80"}
];

const getaways = [
  {id:"bali",title:"Bali Getaway",location:"Indonesia",image:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&auto=format&fit=crop&q=80",description:"Relax on tropical beaches and explore ancient temples.",price:850,rating:4.8},
  {id:"alps",title:"Alpine Adventure",location:"Swiss Alps",image:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900&auto=format&fit=crop&q=80",description:"Skiing, cozy cabins, and breathtaking mountain views.",price:1200,rating:4.9},
  {id:"tokyo",title:"Tokyo City Explorer",location:"Japan",image:"https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=900&auto=format&fit=crop&q=80",description:"Neon lights, historic shrines, and world-class street food.",price:1100,rating:4.7}
];

const rates: Record<string,number>={INR:1,USD:.0119,EUR:.0109,GBP:.0094};
const symbols: Record<string,string>={INR:"₹",USD:"$",EUR:"€",GBP:"£"};
const money=(n:number,c:string)=>{const rate=rates[c]??1;const value=Number.isFinite(n)?n:0;return `${symbols[c]||"₹"}${Math.round(value*rate).toLocaleString("en-IN")}`};
type HomePageKey = "home"|"bus"|"train"|"flight"|"hotel"|"assistant"|"login"|"admin"|"results"|"booking"|"success"|"planner"|"trips"|"community"|"details";

export default function Home({
  mode,onMode,onSearch,onNavigate,currency,onDetails
}:{
  mode:Mode;
  onMode:(m:Mode)=>void;
  onSearch:(from:string,to:string,date:string,passengers?:number)=>void;
  onNavigate:(page:HomePageKey)=>void;
  currency:string;
  onDetails?:(trip:Trip)=>void;
}) {
  const [term,setTerm]=useState("");
  const [cat,setCat]=useState("All");
  const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
  const modes:Array<{key:Mode;title:string;copy:string;image:string;accent:string}>=
    (["bus","train","flight"] as Mode[]).map(key=>({
      key,
      title:key==="bus"?"Bus":key==="train"?"Train":"Flight",
      copy:key==="bus"?"Sleeper, AC and premium coaches with route comparison.":key==="train"?"Express schedules, classes and availability.":"Compare fares, timings and nonstop options.",
      image:images[key],
      accent:key==="bus"?"green":key==="train"?"blue":"orange"
    }));

  const filtered=destinations.filter(d=>(cat==="All"||d.category===cat)&&d.name.toLowerCase().includes(term.toLowerCase()));

  return <main>
    <section className="hero ref-hero">
      <div className="hero-copy">
        <span className="eyebrow">YOUR ALL-IN-ONE TRAVEL COMPANION</span>
        <h1>Plan Your Next Journey<br/>with <em>TripMate</em></h1>
        <p>Search, compare, plan and book your journey — then keep every travel detail in one place.</p>
        <div className="hero-actions">
          <button className="primary" onClick={()=>document.getElementById("booking-search")?.scrollIntoView({behavior:"smooth"})}>Start planning →</button>
          <button className="ghost" onClick={()=>onNavigate("planner")}>Open smart planner</button>
        </div>
        <div className="hero-trust"><span><b>3</b> travel modes</span><span><b>24/7</b> planning tools</span><span><b>1</b> trip workspace</span></div>
      </div>
      <div className="hero-visual"><div className="hero-image"><img src={images.hero} alt="TripMate travel" onError={(e)=>{e.currentTarget.src=images.flight}} /></div><div className="hero-overlay-card"><span>EXPLORE · BOOK · TRAVEL</span><strong>One journey. A bigger perspective.</strong></div></div>
    </section>

    <section id="booking-search" className="section">
      <div className="section-heading"><div><span className="eyebrow">SEARCH · COMPARE · BOOK</span><h2>Where are you going?</h2></div><span className="muted">Predictive suggestions + flexible filters.</span></div>
      <SearchBox mode={mode} onModeChange={onMode} onSearch={onSearch}/>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="eyebrow">TRAVEL SERVICES</span><h2>Choose your journey</h2></div><span className="muted">Select a service to start.</span></div>
      <div className="ref-mode-grid">
        {modes.map(m=><button key={m.key} className={`ref-mode-card ${m.accent}`} onClick={()=>{onMode(m.key);document.getElementById("booking-search")?.scrollIntoView({behavior:"smooth"})}}>
          <div className="ref-mode-image" style={{backgroundImage:`url(${m.image})`}}/><div className="ref-mode-overlay"/>
          <div className="ref-mode-content"><span className="ref-mode-icon">{m.key==="bus"?"🚌":m.key==="train"?"🚆":"✈"}</span><span className="ref-mode-kicker">{m.title}</span><strong>{m.title}</strong><p>{m.copy}</p><span className="ref-mode-link">Explore {m.title} →</span></div>
        </button>)}
      </div>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="eyebrow">POPULAR DESTINATIONS</span><h2>Find your next escape</h2></div><span className="muted">{filtered.length} destinations</span></div>
      <div className="discover-tools"><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="🔎 Search destinations, cities, beaches..."/><div className="chips">{["All","Beaches","Mountains","Cities","Historic Sites"].map(x=><button type="button" key={x} className={cat===x?"chip active":"chip"} onClick={()=>setCat(x)}>{x}</button>)}</div></div>
      <div className="destination-grid">{filtered.map(d=><button type="button" key={d.code} className="destination-card" onClick={()=>onSearch("Bengaluru",d.name,tomorrow)}><img src={d.image} alt={d.name} onError={(e)=>{e.currentTarget.src=images.hero}}/><div className="destination-shade"/>{d.logo&&<img className="destination-logo" src={d.logo} alt={`${d.name} logo`}/>}<div className="destination-copy"><small>{d.code} · {d.category}</small><strong>{d.name}</strong><span>From {money(d.price,currency)} · View trips →</span></div></button>)}</div>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="eyebrow">INTERACTIVE MAP</span><h2>See destinations at a glance.</h2></div></div>
      <div className="home-map-wrap"><div className="mock-map home-map">{destinations.slice(0,6).map((d,i)=><button type="button" key={d.code} className="map-pin" style={{left:`${12+i*15}%`,top:`${25+(i%3)*22}%`}} onClick={()=>document.getElementById(`dest-${d.code}`)?.scrollIntoView({behavior:"smooth",block:"center"})}>📍</button>)}<div className="map-route">Bengaluru <span>→</span> Popular destinations</div></div><div className="map-mini-list">{destinations.slice(0,6).map(d=><button type="button" id={`dest-${d.code}`} key={d.code} onClick={()=>onSearch("Bengaluru",d.name,tomorrow)}><span>{d.code}</span><b>{d.name}</b><small>{d.category} · {money(d.price,currency)}</small></button>)}</div></div>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="eyebrow">FEATURED GETAWAYS</span><h2>Travel beyond the usual.</h2></div></div>
      <div className="getaway-grid">{getaways.map(g=><article className="getaway-card" key={g.id}><img src={g.image} alt={g.title} onError={(e)=>{e.currentTarget.src=images.hotel}}/><div className="getaway-copy"><div><span>{g.location}</span><b>{money(g.price,currency)}</b></div><h3>{g.title}</h3><p>{g.description}</p><div className="rating">★★★★★ <span>{g.rating}</span></div><button type="button" className="primary small" onClick={()=>onNavigate("planner")}>Build this trip</button></div></article>)}</div>
    </section>

    <section className="section ai-banner"><div className="ai-orb">✦</div><div><span className="eyebrow">TRIPMATE AI · BETA</span><h2>Turn any destination into a complete plan.</h2><p>Itinerary, budget, packing list and travel preparation in one workspace.</p></div><button className="primary" onClick={()=>onNavigate("planner")}>Generate a plan →</button></section>
    <section className="section feature-grid"><article className="feature-card"><span className="feature-icon">🗺️</span><h3>Interactive map</h3><p>Explore destinations and highlight matching trips.</p></article><article className="feature-card"><span className="feature-icon">❤️</span><h3>Saved favorites</h3><p>Keep favorite trips available across sessions.</p></article><article className="feature-card"><span className="feature-icon">🌤️</span><h3>Weather + packing</h3><p>Prepare for the destination before you leave.</p></article><article className="feature-card"><span className="feature-icon">🎫</span><h3>Trip Wallet</h3><p>Keep confirmations and tickets together.</p></article></section>
    <section className="section cta"><span className="eyebrow">TRIPMATE</span><h2>From discovery to memories.</h2><p>One connected travel workspace for the journey ahead.</p><button className="primary" onClick={()=>onNavigate("planner")}>Open TripMate Planner →</button></section>
  </main>;
}
