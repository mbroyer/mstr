/* 16 Vorlagen (Stil, Tempo, Swing, Kick/Snare/Hat; genutzt werden die ersten 16 Schritte). Die erste ist die Start-Vorlage */
var BEATS=[
  {n:'lofi',bpm:82,sw:.36,K:'x......xx.....x.x......xx.....x.',S:'....o.......o.......o.......o...',H:'x.xox.x.x.xox.x.x.xox.x.x.xox.x.',hv:[.12,.07],fill:'tom'},
  {n:'house',bpm:116,sw:0,K:'x...x...x...x...x...x...x...x...',S:'....c.......c.......c.......c...',H:'..O...O...O...O...O...O...O...O.',hv:[.2,.2],fill:'tom',clap:true},
  {n:'funk',bpm:102,sw:.16,K:'x..x..x...x..x..x..x.x....x..x..',S:'....x..o....x..o....x..o....x...',H:'xoxoxoxoxoxoxoxoxoxoxoxoxoxoxoxo',hv:[.14,.07],fill:'snare'},
  {n:'rock',bpm:108,sw:.05,K:'x.x...x.x..x....x.x...x.x..x....',S:'....x.......x.......x.......x...',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.2,.12],fill:'tom'},
  {n:'techno',bpm:138,sw:0,K:'x...x...x...x...x...x...x...x.x.',S:'....c.......c.......c.......c...',H:'xxOxxxOxxxOxxxOxxxOxxxOxxxOxxxOx',hv:[.15,.09],fill:'snare'},
  {n:'trap',bpm:136,sw:0,K:'x.....x...x.....x.......x.x.....',S:'........x.......c.......x.......',H:'x.x.x.x.xxxx.x.xx.x.x.x.xxxxx.x.',hv:[.16,.1],fill:'snare'},
  {n:'onedrop',bpm:76,sw:.3,K:'........x...............x.......',S:'........o...............o.......',H:'x.x.x.x.x.x.x.O.x.x.x.x.x.x.x.O.',hv:[.12,.07],fill:'tom'},
  {n:'pop80',bpm:139,sw:0,K:'x.....x.x.......x.....x.x.......',S:'....x.......x.......x.......x...',H:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',hv:[.15,.08],fill:'tom'},
  {n:'dnb',bpm:168,sw:0,K:'x.........x.....x...........x...',S:'....x.......x.......x.......x...',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.14,.09],fill:'snare'},
  {n:'afrobeats',bpm:106,sw:.12,K:'x.....x.x...x...x.....x.x...x...',S:'...o..o....c..o....o..o....c..o.',H:'xoxxxoxxxoxxxoxxxoxxxoxxxoxxxoxx',hv:[.13,.07],fill:'tom'},
  {n:'reggaeton',bpm:95,sw:0,K:'x...x...x...x...x...x...x...x...',S:'...x..x....x..x....x..x....x..x.',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.14,.08],fill:'snare'},
  {n:'minimal',bpm:126,sw:.08,K:'x...x...x...x...x...x...x...x...',S:'................c.......c.......',H:'..O...O.o.O...O...O...O.o.O...Oo',hv:[.14,.08],fill:'tom'},
  {n:'twostep',bpm:132,sw:.3,K:'x.........x..x..x.........x..x..',S:'....c.......c.......c.......c...',H:'..x.x.O...x.x.Ox..x.x.O...x.x.Ox',hv:[.14,.08],fill:'snare'},
  {n:'jungle',bpm:162,sw:0,K:'x.x.......xx....x.x.......xx....',S:'....x..o.o..x..o....x..o.o..x..o',H:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',hv:[.14,.08],fill:'snare'},
  {n:'electro',bpm:124,sw:0,K:'x.....x...x.x...x.....x...x.x...',S:'....c.......c.......c.......c...',H:'x.x.x.O.x.x.x.O.x.x.x.O.x.x.x.O.',hv:[.15,.1],fill:'snare'},
  {n:'amapiano',bpm:113,sw:.1,K:'x...x...x...x...x...x...x...x...',S:'..o..o....o..c....o..o....o..c..',H:'..O...O...O...O...O...O...O...O.',hv:[.12,.07],fill:'tom'}
];
