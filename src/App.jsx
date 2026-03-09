import { useState, useEffect, useCallback } from "react";

const B = {
  linen:      "#F2EEE6",
  linenDeep:  "#E8E2D8",
  linenMid:   "#EDE8DF",
  tan:        "#C6A585",
  tanLight:   "#DFC4A8",
  tanDim:     "#9A7A5F",
  granite:    "#405147",
  graniteDeep:"#2E3B33",
  graniteLight:"#506158",
  ash:        "#9CB7B1",
  ashLight:   "#C4D8D4",
  ashDeep:    "#6A8E88",
  sage:       "#BEC9A6",
  sageDark:   "#8A9A74",
  azure:      "#D1E1DD",
  azureDark:  "#9DBDB8",
  text:       "#2C2C2A",
  textMid:    "#5A5A54",
  textFaint:  "#9A9A90",
  white:      "#FFFFFF",
  warning:    "#9B2335",
  warningBg:  "rgba(155,35,53,0.08)",
  warningBorder:"rgba(155,35,53,0.2)",
};

const LICK_STAGES = [
  { n:"01", label:"Repetition",    desc:"Internalize every note at slow tempo. Feel each hit." },
  { n:"02", label:"Orchestration", desc:"Move around the kit — surfaces, voicings, tone." },
  { n:"03", label:"Omitting",      desc:"Remove notes. Hear what negative space does." },
  { n:"04", label:"Displacement",  desc:"Shift where it lands in the bar relative to beat one." },
  { n:"05", label:"Contraction",   desc:"Compress into a shorter rhythmic space." },
  { n:"06", label:"Stretching",    desc:"Expand the lick across more bars." },
];

const DEFAULT_SETTINGS = {
  drummer:"", album:"", totalTracks:"",
  regime:{
    one:  "Warm-Up 10 · Rudiments 10 · Lick 10 · Song 15 · Groove 10 · Review 5",
    two:  "Warm-Up 15 · Rudiments 15 · Lick 20 · Song 30 · Groove 20 · Independence 15 · Review 10",
    three:"Warm-Up 20 · Rudiments 20 · Lick 30 · Song 45 · Groove 30 · Independence 25 · Reading 20 · Cool-Down 10",
  }
};

const DEFAULT_WEEK = {
  weekLabel:"", goal:"", blogTopic:"", blogAngle:"",
  journalPrompt:"", song:"", trackNum:"", lick:"", lickTempo:"",
};

function getWeekLabel() {
  const now = new Date(), day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() + (day===0?-6:1-day));
  const fri = new Date(mon); fri.setDate(mon.getDate()+4);
  const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  return `${fmt(mon)} – ${fmt(fri)}, ${fri.getFullYear()}`;
}
function getDayOfWeek() {
  return new Date().toLocaleDateString("en-US",{weekday:"long"});
}

/* ── STYLES ─────────────────────────────────────────────────────────────────── */
const Styles = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,500&family=Work+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <style>{`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body{background:${B.linen};color:${B.text};font-family:'Work Sans',sans-serif;-webkit-font-smoothing:antialiased;}

      .serif{font-family:'Fraunces',Georgia,serif;}
      .mono{font-family:'JetBrains Mono',monospace;}

      ::-webkit-scrollbar{width:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:${B.tanLight};border-radius:2px;}

      input,textarea{
        background:${B.white};border:1.5px solid ${B.linenDeep};border-radius:8px;
        color:${B.text};font-family:'Work Sans',sans-serif;font-size:15px;
        padding:11px 14px;width:100%;transition:border-color .18s,box-shadow .18s;
        outline:none;resize:none;-webkit-appearance:none;
      }
      input:focus,textarea:focus{border-color:${B.ash};box-shadow:0 0 0 3px rgba(156,183,177,.18);}
      input::placeholder,textarea::placeholder{color:${B.textFaint};}

      .btn-primary{
        background:${B.granite};border:none;border-radius:8px;
        color:${B.linen};cursor:pointer;font-family:'Work Sans',sans-serif;
        font-size:14px;font-weight:600;letter-spacing:.04em;
        padding:11px 22px;transition:background .18s,transform .1s;
        -webkit-tap-highlight-color:transparent;touch-action:manipulation;
      }
      .btn-primary:hover{background:${B.graniteLight};}
      .btn-primary:active{transform:scale(.97);}

      .btn-ghost{
        background:transparent;border:1.5px solid ${B.linenDeep};border-radius:8px;
        color:${B.textMid};cursor:pointer;font-family:'Work Sans',sans-serif;
        font-size:14px;font-weight:500;padding:10px 18px;
        transition:border-color .18s,color .18s,background .18s;
        -webkit-tap-highlight-color:transparent;touch-action:manipulation;
      }
      .btn-ghost:hover{border-color:${B.tan};color:${B.tanDim};background:rgba(198,165,133,.07);}

      .btn-text{
        background:none;border:none;color:${B.textFaint};cursor:pointer;
        font-family:'Work Sans',sans-serif;font-size:13px;padding:6px 2px;
        transition:color .15s;-webkit-tap-highlight-color:transparent;
      }
      .btn-text:hover{color:${B.tanDim};}

      .label{
        color:${B.tanDim};font-size:10px;font-weight:600;
        letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px;
        font-family:'Work Sans',sans-serif;
      }

      .card{background:${B.white};border:1px solid ${B.linenDeep};border-radius:14px;padding:22px;}
      .card-granite{background:${B.granite};border-radius:14px;padding:22px;}
      .card-ash{background:${B.azure};border:1px solid ${B.ashLight};border-radius:14px;padding:22px;}

      @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
      .fade-up{animation:fadeUp .35s ease forwards;}

      @keyframes modalIn{from{opacity:0;transform:scale(.97) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
      .modal-in{animation:modalIn .25s ease forwards;}

      @keyframes shimmer{0%,100%{opacity:.5;}50%{opacity:1;}}
      .shimmer{animation:shimmer 2.4s ease infinite;}

      .divider{border:none;border-top:1px solid ${B.linenDeep};margin:0;}

      .stage-card{
        background:${B.linen};border:1px solid ${B.linenDeep};
        border-left:3px solid ${B.ash};border-radius:8px;padding:13px 14px;
        transition:background .15s;
      }
      .stage-card:hover{background:rgba(156,183,177,.12);}

      .progress-track{background:${B.linenDeep};border-radius:4px;height:5px;overflow:hidden;width:100%;}
      .progress-fill{background:linear-gradient(90deg,${B.ash},${B.sage});border-radius:4px;height:100%;transition:width .6s ease;}

      /* ── RESPONSIVE ─────────────────────────────────────────────────── */
      .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
      .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
      .span-2{grid-column:1/-1;}
      .header-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
      .btn-row{display:flex;gap:8px;flex-shrink:0;}
      .meta-row{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;}
      .regime-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
      .bigger-picture-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}

      @media(max-width:700px){
        .grid-2{grid-template-columns:1fr;}
        .grid-3{grid-template-columns:1fr 1fr;}
        .regime-grid{grid-template-columns:1fr;}
        .bigger-picture-grid{grid-template-columns:1fr 1fr;}
        .header-row{flex-direction:column;}
        .btn-row{width:100%;}
        .btn-row .btn-primary,.btn-row .btn-ghost{flex:1;text-align:center;}
      }

      @media(max-width:420px){
        .grid-3{grid-template-columns:1fr;}
        .bigger-picture-grid{grid-template-columns:repeat(3,1fr);}
        .card,.card-granite,.card-ash{padding:18px 16px;}
      }

      /* iOS safe area */
      .page-wrap{
        padding: 24px 24px 56px;
        padding-bottom: max(56px, calc(56px + env(safe-area-inset-bottom)));
      }
      @media(max-width:500px){
        .page-wrap{padding:16px 14px 56px;padding-bottom:max(56px,calc(56px + env(safe-area-inset-bottom)));}
      }

      /* modal scroll lock on mobile */
      .modal-backdrop{
        position:fixed;inset:0;z-index:100;
        background:rgba(44,44,42,.5);
        backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        display:flex;align-items:flex-end;justify-content:center;
        padding:0;
      }
      @media(min-width:600px){
        .modal-backdrop{align-items:center;padding:24px;}
      }
      .modal-sheet{
        background:${B.linen};
        border-radius:20px 20px 0 0;
        box-shadow:0 -8px 40px rgba(44,44,42,.2);
        max-height:92vh;overflow-y:auto;
        padding:28px 22px 40px;
        width:100%;
      }
      @media(min-width:600px){
        .modal-sheet{
          border-radius:16px;
          box-shadow:0 20px 60px rgba(44,44,42,.25);
          max-width:580px;
          padding:32px 36px 36px;
        }
      }
      .modal-handle{
        width:40px;height:4px;background:${B.linenDeep};
        border-radius:2px;margin:0 auto 20px;
      }
      @media(min-width:600px){.modal-handle{display:none;}}
    `}</style>
  </>
);

/* ── SMALL HELPERS ──────────────────────────────────────────────────────────── */
const Label = ({children}) => <div className="label">{children}</div>;
const Divider = ({my=20}) => <hr className="divider" style={{margin:`${my}px 0`}}/>;
const EmptyState = ({msg}) => (
  <div className="shimmer" style={{color:B.textFaint,fontSize:13,fontStyle:"italic",padding:"4px 0"}}>{msg}</div>
);
const FieldGroup = ({label,children,style={}}) => (
  <div style={{marginBottom:18,...style}}>
    <Label>{label}</Label>
    {children}
  </div>
);

/* ── MODAL SHELL ────────────────────────────────────────────────────────────── */
function Modal({onClose,children}){
  useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{document.body.style.overflow=prev;};
  },[]);
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet modal-in">
        <div className="modal-handle"/>
        {children}
      </div>
    </div>
  );
}

/* ── ENTRY MODAL ────────────────────────────────────────────────────────────── */
function EntryModal({week,settings,onSave,onClose}){
  const [d,setD]=useState({...week});
  const s=(k,v)=>setD(p=>({...p,[k]:v}));
  return (
    <Modal onClose={onClose}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div className="serif" style={{fontSize:22,color:B.granite,fontWeight:500}}>This Week</div>
        <button className="btn-text" onClick={onClose} style={{fontSize:22,lineHeight:1}}>×</button>
      </div>

      <FieldGroup label="Week">
        <input value={d.weekLabel} onChange={e=>s("weekLabel",e.target.value)} placeholder={getWeekLabel()}/>
      </FieldGroup>

      <Divider/>

      <FieldGroup label="🎯 Major Goal">
        <textarea rows={2} value={d.goal} onChange={e=>s("goal",e.target.value)}
          placeholder="What would make this week a success?"/>
      </FieldGroup>
      <FieldGroup label="📓 Journal Prompt">
        <textarea rows={2} value={d.journalPrompt} onChange={e=>s("journalPrompt",e.target.value)}
          placeholder="What question do you want to sit with?"/>
      </FieldGroup>

      <Divider/>

      <FieldGroup label="✍️ Blog Topic — Due Friday">
        <input value={d.blogTopic} onChange={e=>s("blogTopic",e.target.value)}
          placeholder="Topic title" style={{marginBottom:8}}/>
        <textarea rows={2} value={d.blogAngle} onChange={e=>s("blogAngle",e.target.value)}
          placeholder="Angle, hook, or key takeaway"/>
      </FieldGroup>

      <Divider/>

      {settings.drummer&&(
        <div style={{background:"rgba(64,81,71,.07)",border:`1px solid rgba(64,81,71,.15)`,
          borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:13,color:B.textMid}}>
          Carrying over — <b style={{color:B.granite}}>{settings.drummer}</b>
          {settings.album&&<> · <b style={{color:B.granite}}>{settings.album}</b></>}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 90px",gap:12,marginBottom:0}}>
        <FieldGroup label="🎵 Song of the Week">
          <input value={d.song} onChange={e=>s("song",e.target.value)} placeholder="Track title"/>
        </FieldGroup>
        <FieldGroup label="Track #">
          <input value={d.trackNum} onChange={e=>s("trackNum",e.target.value)}
            placeholder={`/ ${settings.totalTracks||"?"}`}/>
        </FieldGroup>
      </div>

      <Divider/>

      <FieldGroup label="🔁 Lick of the Week">
        <textarea rows={3} value={d.lick} onChange={e=>s("lick",e.target.value)}
          placeholder="Describe the lick — e.g. triplet fill starting on beat 3, snare to toms"/>
      </FieldGroup>
      <FieldGroup label="Tempo / Feel">
        <input value={d.lickTempo} onChange={e=>s("lickTempo",e.target.value)}
          placeholder="e.g. 60 BPM swing → 120 BPM"/>
      </FieldGroup>

      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={()=>{onSave(d);onClose();}}>Save Week</button>
      </div>
    </Modal>
  );
}

/* ── SETTINGS MODAL ─────────────────────────────────────────────────────────── */
function SettingsModal({settings,onSave,onClose}){
  const [d,setD]=useState({...settings,regime:{...settings.regime}});
  const s=(k,v)=>setD(p=>({...p,[k]:v}));
  const sr=(slot,v)=>setD(p=>({...p,regime:{...p.regime,[slot]:v}}));
  return (
    <Modal onClose={onClose}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div className="serif" style={{fontSize:22,color:B.granite,fontWeight:500}}>Settings</div>
        <button className="btn-text" onClick={onClose} style={{fontSize:22,lineHeight:1}}>×</button>
      </div>

      <FieldGroup label="Drummer of the Year">
        <input value={d.drummer} onChange={e=>s("drummer",e.target.value)} placeholder="e.g. Elvin Jones"/>
      </FieldGroup>
      <FieldGroup label="Album">
        <input value={d.album} onChange={e=>s("album",e.target.value)} placeholder="e.g. A Love Supreme"/>
      </FieldGroup>
      <FieldGroup label="Total Tracks on Album">
        <input value={d.totalTracks} onChange={e=>s("totalTracks",e.target.value)} placeholder="e.g. 9"/>
      </FieldGroup>

      <Divider/>

      <div style={{fontSize:13,color:B.textMid,marginBottom:16,lineHeight:1.6}}>
        Practice regime carries over each week. Separate elements with <span className="mono" style={{fontSize:12}}>·</span> for clean display.
      </div>
      {[["one","1 Hour"],["two","2 Hours"],["three","3 Hours"]].map(([slot,label])=>(
        <FieldGroup key={slot} label={`Practice — ${label}`}>
          <textarea rows={3} value={d.regime[slot]} onChange={e=>sr(slot,e.target.value)}/>
        </FieldGroup>
      ))}

      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={()=>{onSave(d);onClose();}}>Save Settings</button>
      </div>
    </Modal>
  );
}

/* ── DASHBOARD CARDS ─────────────────────────────────────────────────────────── */
function HeaderCard({week,settings,onEdit,onSettings}){
  const pct = settings.totalTracks&&week.trackNum
    ? Math.round((parseInt(week.trackNum)/parseInt(settings.totalTracks))*100) : null;
  return (
    <div className="card-granite fade-up" style={{marginBottom:14}}>
      <div className="header-row">
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:B.sage,fontSize:10,fontWeight:600,letterSpacing:".15em",
            textTransform:"uppercase",marginBottom:6,fontFamily:"'Work Sans',sans-serif"}}>
            {getDayOfWeek()}
          </div>
          <div className="serif" style={{fontSize:26,color:B.linen,fontWeight:400,lineHeight:1.2}}>
            {week.weekLabel||getWeekLabel()}
          </div>
          <div className="meta-row" style={{fontSize:13,color:B.ashLight}}>
            {settings.drummer&&<span>🥁 {settings.drummer}</span>}
            {settings.album&&<span>💿 {settings.album}</span>}
            {week.song&&<span>🎵 {week.song}{week.trackNum?` · Track ${week.trackNum}`:""}</span>}
          </div>
          {pct!==null&&(
            <div style={{marginTop:14,maxWidth:300}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:B.ashLight,letterSpacing:".08em",fontFamily:"'Work Sans',sans-serif",fontWeight:500}}>
                  ALBUM PROGRESS
                </span>
                <span style={{fontSize:10,color:B.sage,fontWeight:700,fontFamily:"'Work Sans',sans-serif"}}>{pct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{width:`${pct}%`}}/>
              </div>
            </div>
          )}
        </div>
        <div className="btn-row">
          <button className="btn-ghost" onClick={onSettings}
            style={{borderColor:"rgba(242,238,230,.2)",color:B.ashLight,fontSize:13,padding:"9px 14px"}}>
            ⚙
          </button>
          <button className="btn-primary" onClick={onEdit}
            style={{background:B.tan,color:B.graniteDeep,fontSize:13,padding:"9px 18px"}}>
            ✦ Enter Week
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalCard({week}){
  return (
    <div className="card fade-up" style={{borderLeft:`4px solid ${B.granite}`,borderRadius:"4px 14px 14px 4px"}}>
      <Label>🎯 Major Goal</Label>
      {week.goal
        ? <div className="serif" style={{fontSize:19,color:B.granite,lineHeight:1.55,fontStyle:"italic"}}>
            "{week.goal}"
          </div>
        : <EmptyState msg="No goal set yet."/>}
    </div>
  );
}

function BlogCard({week}){
  return (
    <div className="card fade-up">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <Label>✍️ Blog Post</Label>
        <div style={{background:B.tan,borderRadius:20,color:B.white,
          fontSize:9,fontWeight:700,letterSpacing:".1em",padding:"3px 10px",
          fontFamily:"'Work Sans',sans-serif",flexShrink:0}}>
          DUE FRIDAY
        </div>
      </div>
      {week.blogTopic
        ? <>
            <div style={{fontSize:15,fontWeight:600,color:B.text,marginBottom:6}}>{week.blogTopic}</div>
            {week.blogAngle&&<div style={{fontSize:13,color:B.textMid,lineHeight:1.6}}>{week.blogAngle}</div>}
          </>
        : <EmptyState msg="Topic not yet set — let it stew."/>}
    </div>
  );
}

function JournalCard({week}){
  return (
    <div className="card-ash fade-up">
      <Label>📓 Journal Prompt</Label>
      {week.journalPrompt
        ? <div className="serif" style={{fontSize:17,color:B.graniteDeep,lineHeight:1.75,fontStyle:"italic"}}>
            {week.journalPrompt}
          </div>
        : <EmptyState msg="No prompt set."/>}
    </div>
  );
}

function SongCard({week,settings}){
  return (
    <div className="card fade-up">
      <Label>🎵 Song of the Week</Label>
      {week.song
        ? <div style={{fontSize:17,fontWeight:600,color:B.granite,marginBottom:14}}>{week.song}</div>
        : <EmptyState msg="No song set."/>}
      {settings.drummer&&(
        <div style={{background:B.linen,border:`1px solid ${B.linenDeep}`,borderRadius:9,padding:"12px 14px",
          marginTop: week.song ? 0 : 12}}>
          <div style={{fontSize:9,color:B.textFaint,letterSpacing:".12em",textTransform:"uppercase",
            marginBottom:10,fontFamily:"'Work Sans',sans-serif",fontWeight:600}}>The Bigger Picture</div>
          <div className="bigger-picture-grid">
            {[["Drummer",settings.drummer],["Album",settings.album||"—"],
              ["Track",week.trackNum?`${week.trackNum} of ${settings.totalTracks||"?"}`:"—"]
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:9,color:B.textFaint,letterSpacing:".1em",textTransform:"uppercase",
                  marginBottom:3,fontFamily:"'Work Sans',sans-serif",fontWeight:600}}>{k}</div>
                <div style={{fontSize:13,fontWeight:600,color:B.graniteDeep}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LickCard({week}){
  return (
    <div className="card fade-up span-2">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        flexWrap:"wrap",gap:12,marginBottom:16}}>
        <div style={{flex:1,minWidth:0}}>
          <Label>🔁 Lick of the Week</Label>
          {week.lick
            ? <div style={{fontSize:15,fontWeight:600,color:B.text,marginBottom:4}}>{week.lick}</div>
            : <EmptyState msg="No lick set."/>}
          {week.lickTempo&&<div style={{fontSize:13,color:B.textMid}}>⏱ {week.lickTempo}</div>}
        </div>
        <div style={{background:B.warningBg,border:`1px solid ${B.warningBorder}`,
          borderRadius:8,padding:"10px 14px",fontSize:12,color:B.warning,
          fontWeight:600,maxWidth:240,lineHeight:1.55,flexShrink:0}}>
          ⚠️ COUNT out loud at every stage. No exceptions.
        </div>
      </div>

      <Divider my={14}/>

      <div style={{fontSize:9,color:B.textFaint,letterSpacing:".12em",textTransform:"uppercase",
        marginBottom:12,fontFamily:"'Work Sans',sans-serif",fontWeight:600}}>Exploration Cycle</div>
      <div className="grid-3">
        {LICK_STAGES.map((s,i)=>(
          <div key={i} className="stage-card">
            <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:5}}>
              <span className="mono" style={{fontSize:9,color:B.textFaint}}>{s.n}</span>
              <span style={{fontSize:13,fontWeight:600,color:B.granite}}>{s.label}</span>
            </div>
            <div style={{fontSize:12,color:B.textMid,lineHeight:1.55}}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegimeCard({settings}){
  const colors=[
    {bg:B.linen,    border:B.linenDeep, label:B.tanDim},
    {bg:B.azure,    border:B.ashLight,  label:B.ashDeep},
    {bg:B.sage+"30",border:B.sage,      label:B.sageDark},
  ];
  return (
    <div className="card fade-up span-2">
      <Label>⏱ Practice Regime</Label>
      <div className="regime-grid" style={{marginTop:4}}>
        {[["one","1 Hour"],["two","2 Hours"],["three","3 Hours"]].map(([slot,label],i)=>(
          <div key={slot} style={{background:colors[i].bg,border:`1px solid ${colors[i].border}`,
            borderRadius:10,padding:"16px 16px"}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
              color:colors[i].label,marginBottom:10,fontFamily:"'Work Sans',sans-serif"}}>{label}</div>
            <div style={{fontSize:13,color:B.textMid,lineHeight:1.9}}>
              {settings.regime[slot]
                ? settings.regime[slot].split("·").map((seg,j)=>(
                    <div key={j} style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:2}}>
                      <span style={{color:B.ash,fontSize:10,flexShrink:0,marginTop:1}}>▸</span>
                      <span>{seg.trim()}</span>
                    </div>
                  ))
                : <span style={{color:B.textFaint,fontStyle:"italic"}}>Not set</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ONBOARDING ──────────────────────────────────────────────────────────────── */
function Onboarding({onSetup,onEnter}){
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"55vh",textAlign:"center",padding:"40px 20px"}}>
      <div className="serif shimmer" style={{fontSize:52,marginBottom:16}}>🥁</div>
      <div className="serif" style={{fontSize:28,color:B.granite,marginBottom:10,fontWeight:400}}>
        Welcome, Zach.
      </div>
      <div style={{fontSize:15,color:B.textMid,maxWidth:360,lineHeight:1.7,marginBottom:32}}>
        Set your persistent details first — drummer, album, practice regime — then enter your first week.
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
        <button className="btn-ghost" onClick={onSetup}>⚙ Settings First</button>
        <button className="btn-primary" onClick={onEnter}>✦ Enter This Week</button>
      </div>
    </div>
  );
}

/* ── APP ─────────────────────────────────────────────────────────────────────── */
export default function App(){
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [week,setWeek]=useState({...DEFAULT_WEEK,weekLabel:getWeekLabel()});
  const [showEntry,setShowEntry]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [loading,setLoading]=useState(true);

  const hasContent=week.goal||week.blogTopic||week.song||week.lick||week.journalPrompt;

  useEffect(()=>{
      try{
        const s=localStorage.getItem("zrm-settings");
        if(s) setSettings(JSON.parse(s));
        const w=localStorage.getItem("zrm-week");
        if(w) setWeek(JSON.parse(w));
      }catch(_){}
      setLoading(false);
  },[]);

  const saveWeek=useCallback((data)=>{
    setWeek(data);
    try{localStorage.setItem("zrm-week",JSON.stringify(data));}catch(_){}
  },[]);

  const saveSettings=useCallback((data)=>{
    setSettings(data);
    setShowSettings(false);
    try{localStorage.setItem("zrm-settings",JSON.stringify(data));}catch(_){}
  },[]);

  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:B.linen}}>
      <Styles/>
      <div className="serif shimmer" style={{fontSize:20,color:B.tanDim}}>Loading…</div>
    </div>
  );

  return(
    <div style={{background:B.linen,minHeight:"100vh"}}>
      <Styles/>
      {showEntry&&<EntryModal week={week} settings={settings} onSave={saveWeek} onClose={()=>setShowEntry(false)}/>}
      {showSettings&&<SettingsModal settings={settings} onSave={saveSettings} onClose={()=>setShowSettings(false)}/>}

      <div className="page-wrap" style={{maxWidth:1020,margin:"0 auto"}}>
        <HeaderCard week={week} settings={settings}
          onEdit={()=>setShowEntry(true)} onSettings={()=>setShowSettings(true)}/>

        {!hasContent&&!settings.drummer
          ? <Onboarding onSetup={()=>setShowSettings(true)} onEnter={()=>setShowEntry(true)}/>
          : (
            <div className="grid-2">
              <GoalCard week={week}/>
              <BlogCard week={week}/>
              <JournalCard week={week}/>
              <SongCard week={week} settings={settings}/>
              <LickCard week={week}/>
              <RegimeCard settings={settings}/>
            </div>
          )}

        <div style={{marginTop:40,textAlign:"center",fontSize:12,color:B.textFaint,fontStyle:"italic"}}>
          Zach Ross Music · Weekly Intentions Dashboard
        </div>
      </div>
    </div>
  );
}
