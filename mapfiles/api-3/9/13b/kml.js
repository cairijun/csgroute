google.maps.__gjsload__('kml', '\'use strict\';var mJ={UNKNOWN:0,OK:1,INVALID_REQUEST:2,DOCUMENT_NOT_FOUND:3,FETCH_ERROR:4,INVALID_DOCUMENT:5,DOCUMENT_TOO_LARGE:6,LIMITS_EXCEEDED:7,INTERNAL_ERROR:8,TIMED_OUT:9,$l:10};function nJ(a){this.b=a||[]}var oJ;function pJ(a){this.b=a||[]}function qJ(a){this.b=a||[]}function rJ(a){this.b=a||[]}function sJ(a){this.b=a||[]}function tJ(a){this.b=a||[]}function uJ(a){this.b=a||[]}function vJ(a){this.b=a||[]}function wJ(a){this.b=a||[]}function xJ(a){this.b=a||[]}function yJ(a){this.b=a||[]}function zJ(){this.b=[]}var AJ;function BJ(a){this.b=a||[]}var CJ={uh:0,yl:1,xl:2},DJ={Lg:0,am:1,Pe:2};Ia(nJ[F],function(){var a=this.b[0];return a!=k?a:""});\nIa(pJ[F],function(){var a=this.b[0];return a!=k?a:""});var EJ=new rJ;function FJ(a){return(a=a.b[4])?new rJ(a):EJ}var GJ=new sJ,HJ=new pJ,IJ=new nd,JJ=new pJ,KJ=new uJ;function LJ(a){return(a=a.b[1])?new uJ(a):KJ}var MJ=new uJ;function NJ(a){return(a=a.b[2])?new uJ(a):MJ}var OJ=new wJ;function PJ(a){return(a=a.b[3])?new wJ(a):OJ}function QJ(a){a=a.b[0];return a!=k?a:0}function RJ(a){a=a.b[1];return a!=k?a:0}var SJ=new tJ;function TJ(a){return(a=a.b[0])?new tJ(a):SJ}var UJ=new tJ;\nfunction VJ(a){return(a=a.b[1])?new tJ(a):UJ}function WJ(a){a=a.b[0];return a!=k?a:0}var XJ=new tJ;function YJ(a){return(a=a.b[1])?new tJ(a):XJ}var ZJ=new vJ;function $J(a){return(a=a.b[0])?new vJ(a):ZJ}var aK=new vJ;function bK(a){return(a=a.b[1])?new vJ(a):aK}var cK=new BJ;ij(yJ[F],function(){var a=this.b[0];return a!=k?a:-1});var dK=new xJ,eK=new nd;yJ[F].getDefaultViewport=function(){var a=this.b[4];return a?new nd(a):eK};function fK(a){this.b=a}Ui(fK[F],function(a,b,c){var d=new nJ;d.b[0]=a;b&&(d.b[1]=b);oJ||(a=[],oJ={ba:-1,$:a},a[1]={type:"s",label:1},a[2]={type:"s",label:1});d=jd(d.b,oJ);a=N(this,this.d,c);c=N(this,this.f,c);this.b(d,a,c)});fK[F].f=function(a){a(k)};fK[F].d=function(a,b){a(new yJ(b))};function gK(a){this.d=0;this.f=[];this.b=a}Ui(gK[F],function(a,b,c){this.d++;c=fe(N(this,this.e,c));this.b[Sj](a,b,c)});gK[F].e=function(a,b){this.f[B](N(k,a,b));this.d--;if(0==this.d){for(var c=0;c<this.f[E];++c)this.f[c]();this.f=[]}};function hK(){Vg[Fc](this)}J(hK,Vg);Yi(hK[F],function(){iK(this)});mp(hK[F],function(){iK(this)});hK[F].projectionBounds_changed=function(){this.O()};hK[F].aa=function(){var a=this.get("projectionBounds"),b=this.get("zoom"),c=this.get("projection");if(a&&c&&K(b)){a=uf(a.F,a.D,a.G,a.H);b=Qk(c,b);c=(a.F+a.G)/2;b=c-Kd(c,0,n[qc](b.x*b.x+b.y*b.y));a.G-=b;a.F-=b;if(!this.b||!this.b.eb(a))b=a[Rj](),a=Eq(a),this.b=new tf([new T(b.x-a[s],b.y-a[A]),new T(b.x+a[s],b.y+a[A])]);iK(this)}};\nfunction iK(a){if(a.b){var b;b=a.b[Rj]();var c=a.get("projection"),d=a.get("bounds"),e=a.get("zoom");b=c&&d&&K(e)?al(c,d,e,sf,b):ba;b=uf(xd(a.b.F,b.F),xd(a.b.D,b.D),yd(a.b.G,b.G),yd(a.b.H,b.H));b[oc](a.d)||(a.set("croppedBounds",b),a.d=b)}};function jK(a,b){Vg[Fc](this);this.d=a;this.b=b}J(jK,Vg);Ra(jK[F],function(a){("bounds"==a||"zoom"==a||"projection"==a)&&this.O()});\njK[F].aa=function(){var a=this.get("projection"),b=this.get("bounds"),c=this.get("zoom");this.b[tb](function(a){a.di=j});if(a&&b&&K(c)&&!b[fc]())for(var d=n[C](b.D),b=n[C](b.H),e=this.get("projection"),f=this.get("zoom"),g=this.d,a=(new P(g.ca.f,g.ea.b,j)).lng(),c=(new P(g.ca.b,g.ea.f,j)).lng(),e=Vk(e,g,f),e=n[C](Eq(e)[s]),g=g[ob]().lat()-g[Mb]().lat(),h=kK(this,d),i=d;d<=b;++d){var f=kK(this,d),p;p=i;var r=d,t=h,w=f,z=(t+w)/2,D=kK(this,(p+r)/2);p=ud((D-z)*((p-r)/(w-t)));r=ud(d-i);if(1<=p&&10<r||\nd==b)p=new P(f,c),h=new P(h,a),i=new U(e,d-i),h=new oe(p,h),p=g,r=h[ob]().lat(),t=h[Mb]().lat(),t=i[A]/(r-t),r=(this.d[ob]().lat()-r)*t,p=ud(p*t),r=new T(0,r),h=h[ob](),this.b.W({d:r,position:h,f:i,scaledSize:new U(i[s],p)}),i=d,h=f}fe(N(this,this.e))()};jK[F].e=function(){this.b[tb](function(a){a.di&&this[qb](a)})};function kK(a,b){var c=a.get("projection"),d=a.get("zoom");return Wk(c,new T(0,b),d).lat()};function lK(a,b,c){Vg[Fc](this);this.d=a;this.L=b;this.b=c;this.l={alpha:j,scale:j};Q[y](c,Ze,N(this,this.kj));Q[y](c,$e,N(this,this.lg))}J(lK,Vg);H=lK[F];Ra(H,function(){this.O()});$i(H,function(){var a=mK(this);this.b[tb](function(b){mm(b.kc,a,j)})});function mK(a){a=a.get("opacity");return Pd(a,1)}\nH.aa=function(){if(Dq(this.b)){var a=this.get("projection"),b=this.get("zoom"),c=this.get("center"),d=this.get("offset"),e=this.get("latLngBounds"),f=mK(this);if(K(b)&&e&&a&&d&&c&&(e=al(a,e,b,d,c))&&!e[oc](this.e))this.e=e,this.b[tb](N(this,this.lg)),this.b[tb](N(this,this.Ng,a,b,c,d,f))}};H.kj=function(a){var b=this.get("projection"),c=this.get("zoom"),d=this.get("center"),e=this.get("offset"),f=mK(this);b&&(K(c)&&e&&d)&&this.Ng(b,c,d,e,f,a)};\nH.Ng=function(a,b,c,d,e,f){f.b=Uk(a,f[Bj],b,c,d[s],d[A],k);f.kc=Wq(this.d,this.L,f.d,f.f,f.b,f[cq],this.l);mm(f.kc,e,j);km(f.kc,10)};H.lg=function(a){a.kc&&(kr(a.kc),a.kc=k)};function nK(a,b,c){this.b=N(k,Yn,a,b,Dl+"/maps/api/js/KmlOverlayService.GetFeature",c)}Ui(nK[F],function(a,b){var c=new zJ;c.b[0]=a.U;c.b[1]=a.f+"";if(a.b)for(var d in a.b){var e;e=[];gd(c.b,2)[B](e);e=new $A(e);e.b[0]=d;e.b[1]=a.b[d]}AJ||(d=[],AJ={ba:-1,$:d},d[1]={type:"s",label:1},d[2]={type:"s",label:1},d[3]={type:"m",label:3,Y:eB()});c=jd(c.b,AJ);this.b(c,b,b);return c});Si(nK[F],function(){aa(ka("Not implemented"))});function oK(a,b){if(RJ(a)==CJ.uh)return QJ(a)*b;if(RJ(a)==CJ.xl)return b-QJ(a);if(RJ(a)==CJ.yl)return QJ(a)}function pK(a,b,c){return WJ(a)==DJ.Pe?(a=RJ(YJ(a))==CJ.uh?QJ(YJ(a))*b:QJ(YJ(a)),a/c):1};function qK(a,b){this.b=b;this.d=k;Q[u](this.b,Ze,this,this.Fg);Q[u](this.b,$e,this,this.Gg)}J(qK,V);H=qK[F];H.innerContainer_changed=function(){var a=this.L;this.L=this.get("innerContainer");this.d&&(Q[kb](this.d),delete this.d);a&&this.b[tb](N(this,this.Gg));this.L&&(this.d=Q[u](this.L,ol,this,this.sj),this.b[tb](N(this,this.Fg)))};H.sj=function(){var a=this;fe(function(){a.b[tb](N(a,a.$g))})()};\nH.Fg=function(a){if(this.L){var b=Xg(this.L),b=$("div",this.L,new T(b[s],b[A]));fm(b);km(b,2);a.fa=b;b=$("div",a.fa,new T(0,0),k,j);fm(b);a.b=b;var b={alpha:j,scale:j,Ma:N(this,this.zj,a)},c=a.f.b[0];a.pa=Vm((c?new pJ(c):JJ)[Kj](),a.fa,k,k,b)}};H.Gg=function(a){a.fa&&Zk(a.fa);a.b&&Zk(a.b);a.pa&&Zk(a.pa);a.fa=k;a.pa=k;a.b=k};H.zj=function(a,b,c){a.fa&&c&&(a.pa=c,fm(c),this.$g(a))};\nH.$g=function(a){var b=Xg(this.L),c=new U(WJ($J(PJ(a.f)))==DJ.Lg?Xg(a.pa)[s]:WJ($J(PJ(a.f)))==DJ.Pe?oK(YJ($J(PJ(a.f))),b[s]):Xg(a.pa)[s]*pK(bK(PJ(a.f)),b[A],Xg(a.pa)[A]),WJ(bK(PJ(a.f)))==DJ.Lg?Xg(a.pa)[A]:WJ(bK(PJ(a.f)))==DJ.Pe?oK(YJ(bK(PJ(a.f))),b[A]):Xg(a.pa)[A]*pK($J(PJ(a.f)),b[s],Xg(a.pa)[s])),d=oK(TJ(NJ(a.f)),b[s]),e=oK(VJ(NJ(a.f)),b[A]),e=b[A]-e-c[A];dm(a.fa,new T(d-oK(TJ(LJ(a.f)),c[s]),e+oK(VJ(LJ(a.f)),c[A])));Wg(a.fa,c);Wg(a.pa,c);Wg(a.b,c)};function rK(a,b,c,d,e,f,g,h,i){var p=a.get("map");if(p&&p==b){var r=ZA.Qa(b),p=sK(b);a.e=g;a.d=h;d&&a.set("defaultViewport",d);a.set("metadata",e);a.set("status",f);a.l=i;d=new nK(fa,fg,eg);e=Fm(d);f=new zA;f.U=c;for(var t in i)f.b[t]=i[t];f.f=N(e,e[Sj]);Yo(f,a.get("clickable")!=l);a.gb=f;r[B](f);a.b||(a.b=Q[y](f,Te,N(a,tK,a,b)));for(c=a.e[E]-1;0<=c;--c)p.W(a.e[c]);for(c=0;c<a.d[E];++c)p=a.d[c],p.zc.set("map",b),p.zc[q]("clickable",a),i=d,t=new AA(a.gb.U,p.U),r=N(a,uK,a,b,p.zc.get("bounds")[Rj](),\nk),i=N(i,i[Sj],t,r),p.Fb=Q[y](p.zc,Te,i);c=a.get("preserveViewport");d=a.get("defaultViewport");!c&&d&&b.fitBounds(d);b=new $f;b=new wB(a,b);b[q]("map",a);b[q]("suppressInfoWindows",a);a.wa=b;Q[y](a,"clickable_changed",function(){Yo(a.gb,a.get("clickable")!=l)})}}\nfunction uK(a,b,c,d,e){b={};b.latLng=c;b.pixelOffset=d;if(!e.infoWindowHtml){a:if(c=$("div",k,k,k,k,{style:"font-family: Arial, sans-serif; font-size: small"}),e.info_window_html)jr(c,e.info_window_html);else if(e[vc]||e[tq]){if(e[vc]&&(d=$("div",c,k,k,k,{style:"font-weight: bold; font-size: medium; margin-bottom: 0em"}),em(e[vc],d)),e[tq])d=$("div",c),jr(d,e[tq])}else{c=k;break a}d="";c&&(d=fa[rb]("div"),d[$a](c),d=d[Wp]);e.infoWindowHtml=d}b.featureData=e;Q[o](a,Te,b)}\nfunction tK(a,b,c,d,e,f){uK(a,0,d,e,f)}\nfunction vK(a,b){if(b&&a&&0==b[ok]()){for(var c=[],d=[],e={},f=0;f<hd(b.b,5);++f){var g=new qJ(gd(b.b,5)[f]);if(g.b[5]!=k)g=g.b[5],d[B]({f:g?new sJ(g):GJ});else if(g.b[4]!=k){var h=FJ(g).b[1],h=wK(h?new nd(h):IJ),i=FJ(g).b[0],h=new hg((i?new pJ(i):HJ)[Kj](),h),g=g.b[0];c[B]({zc:h,U:g!=k?g:""})}}g=b.b[2];h=b.b[1];g=(h!=k?h:"")+(g!=k?g:"");h=wK(b.getDefaultViewport());f=b.b[3];if(f=f?new xJ(f):dK){var p;p=(i=f.b[3])?new BJ(i):cK;var i={},r=p.b[0];Ua(i,r!=k?r:"");r=p.b[2];i.email=r!=k?r:"";p=p.b[1];\ni.uri=p!=k?p:"";p={};r=f.b[0];Ua(p,r!=k?r:"");r=f.b[1];p.description=r!=k?r:"";f=f.b[2];p.snippet=f!=k?f:"";p.author=i;i=p}else i=k;var f=b.b[6],f=f!=k?f:0,t;a:{for(t in ig)if(f==mJ[t]){t=ig[t];break a}t="UNKNOWN"}for(f=0;f<hd(b.b,7);++f)p=new $A(gd(b.b,7)[f]),e[fB(p)]=gB(p);a(g,h,i,t,d,c,e)}}function sK(a){a.e||(a.e=new If,(new qK(0,a.e))[q]("innerContainer",a.N()));return a.e}function wK(a){var b=new P(Mk(Ik(a)),Lk(Ik(a))),a=new P(Mk(Kk(a)),Lk(Kk(a)));return new oe(a,b)};function xK(){}\nxK[F].Fl=function(a){var b=a.f,c=a.f=a.get("map");if(b!=c){if(b){var d,e=ZA.Qa(b);e[tb](function(b,c){b==a.gb&&(d=c)});d!=ba&&e[yb](d);a.b&&(Q[kb](a.b),delete a.b);if(a.e){e=sK(b);for(b=0;b<a.e[E];++b)e[qb](a.e[b])}if(a.d)for(b=0;b<a.d[E];++b)e=a.d[b],e.zc.set("map",k),Q[kb](e.Fb),delete e.Fb;a.wa&&(a.wa[qb](),a.wa[rj](),delete a.wa)}c&&(c.A||(b=N(k,Yn,fa,fg,Dl+"/maps/api/js/KmlOverlayService.GetOverlays",eg),c.A=new gK(new fK(b))),a.j||(a.j=xl(function(b){b=N(k,vK,b);c.A[Sj](a.get("url"),a.get("token")||\nk,b)})),a.j(N(k,rK,a,c)))}};\nxK[F].vk=function(a,b){if(b&&!b.K){var c=b.d,d=b.N(),e=b.K={j:function(a,b){if(b)return k;var d=k,e=a.latLng;c[tb](function(a){if(!d){var b=a.get("bounds");b&&(b[Yb](e)&&a.get("clickable")!=l)&&(d=a)}});return d},e:function(a,b,c){a==Ek?d.set("cursor","pointer"):a==Dk&&d.set("cursor",k);Q[o](c,a,new bl(b.latLng,b.b))},zIndex:10};Cq(b.j,e)}a.b&&(a.b.set("bounds",k),a.d[rj](),a.b[rj](),a.e[rj](),delete a.d,delete a.b,delete a.e);if(b){var e=a.get("bounds"),f=a.get("url"),g=b.N(),h=g.get("panes").overlayLayer,\ni=new If;a.j=i;var p=new hK;p[q]("projectionBounds",g);p[q]("projectionTopLeft",g);p[q]("projection",b);p[q]("zoom",b);p.set("bounds",e);a.d=p;var r=new jK(e,i);r[q]("zoom",b);r[q]("projection",b);r[q]("bounds",p,"croppedBounds");a.b=r;f=new lK(f,h,i);f[q]("offset",g);f[q]("zoom",b);f[q]("center",g,"projectionCenterQ");f[q]("projection",b);f[q]("clickable",a);f[q]("opacity",a);f.set("latLngBounds",e);a.e=f;Q[v](f,Te,a)}};var yK=new xK;lf.kml=function(a){eval(a)};of("kml",yK);\n')

