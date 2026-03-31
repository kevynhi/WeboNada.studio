window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-RBF44JBJ9E');
  // Eventos de conversión
  function trackCTA(label){gtag('event','cta_click',{event_category:'conversion',event_label:label});}
  function trackFormSubmit(){gtag('event','form_submit',{event_category:'conversion',event_label:'contacto'});}
