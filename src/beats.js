/* 13 Vorlagen (Stil, Tempo, Swing, Kick/Snare/Hat über 32 Schritte) */
var BEATS=[
  {n:'boombap',bpm:90,sw:.30,K:'x.....x..x......x.....x..x.x....',S:'....x.......x.......x.......x...',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.16,.09],fill:'snare'},
  {n:'house',bpm:116,sw:0,K:'x...x...x...x...x...x...x...x...',S:'....c.......c.......c.......c...',H:'..O...O...O...O...O...O...O...O.',hv:[.2,.2],fill:'tom',clap:true},
  {n:'funk',bpm:102,sw:.16,K:'x..x..x...x..x..x..x.x....x..x..',S:'....x..o....x..o....x..o....x...',H:'xoxoxoxoxoxoxoxoxoxoxoxoxoxoxoxo',hv:[.14,.07],fill:'snare'},
  {n:'rock',bpm:108,sw:.05,K:'x.x...x.x..x....x.x...x.x..x....',S:'....x.......x.......x.......x...',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.2,.12],fill:'tom'},
  {n:'techno',bpm:138,sw:0,K:'x...x...x...x...x...x...x...x.x.',S:'....c.......c.......c.......c...',H:'xxOxxxOxxxOxxxOxxxOxxxOxxxOxxxOx',hv:[.15,.09],fill:'snare'},
  {n:'trap',bpm:136,sw:0,K:'x.....x...x.....x.......x.x.....',S:'........x.......c.......x.......',H:'x.x.x.x.xxxx.x.xx.x.x.x.xxxxx.x.',hv:[.16,.1],fill:'snare'},
  {n:'disco',bpm:120,sw:0,K:'x...x...x...x...x...x...x...x...',S:'....c.......c.......c.......c...',H:'x.O.x.O.x.O.x.O.x.O.x.O.x.O.x.O.',hv:[.13,.17],fill:'snare'},
  {n:'bossa',bpm:126,sw:0,K:'x..x..x.x..x..x.x..x..x.x..x..x.',S:'..o..o..o..o..o...o..o..o..o..o.',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.12,.08],fill:'tom'},
  {n:'dnb',bpm:168,sw:0,K:'x.........x.....x...........x...',S:'....x.......x.......x.......x...',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.14,.09],fill:'snare'},
  {n:'shuffle',bpm:100,sw:.5,K:'x.......x.......x.......x.......',S:'....x.......x.......x.......x...',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.17,.1],fill:'tom'},
  {n:'afro',bpm:108,sw:.1,K:'x..x..x...x.x...x..x..x...x.x...',S:'....x..o....x..o....x..o....x...',H:'xoxoxoxoxoxoxoxoxoxoxoxoxoxoxoxo',hv:[.13,.07],fill:'tom'},
  {n:'minimal',bpm:126,sw:.08,K:'x...x...x...x...x...x...x...x...',S:'................c.......c.......',H:'..O...O.o.O...O...O...O.o.O...Oo',hv:[.14,.08],fill:'tom'},
  {n:'hardtechno',bpm:148,sw:0,K:'x...x...x...x.x.x...x...x...x.xx',S:'....c.......c.......c.....c.c...',H:'x.x.O.x.x.x.O.x.x.x.O.x.x.x.O.xx',hv:[.17,.1],fill:'snare'}
];
