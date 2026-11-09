function Zt(h){return h&&h.__esModule&&Object.prototype.hasOwnProperty.call(h,"default")?h.default:h}var ie={exports:{}},y={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ke;function Gt(){if(ke)return y;ke=1;var h=Symbol.for("react.element"),o=Symbol.for("react.portal"),M=Symbol.for("react.fragment"),m=Symbol.for("react.strict_mode"),z=Symbol.for("react.profiler"),j=Symbol.for("react.provider"),A=Symbol.for("react.context"),V=Symbol.for("react.forward_ref"),C=Symbol.for("react.suspense"),E=Symbol.for("react.memo"),I=Symbol.for("react.lazy"),P=Symbol.iterator;function H(e){return e===null||typeof e!="object"?null:(e=P&&e[P]||e["@@iterator"],typeof e=="function"?e:null)}var L={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},_=Object.assign,$={};function p(e,a,n){this.props=e,this.context=a,this.refs=$,this.updater=n||L}p.prototype.isReactComponent={},p.prototype.setState=function(e,a){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,a,"setState")},p.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function T(){}T.prototype=p.prototype;function R(e,a,n){this.props=e,this.context=a,this.refs=$,this.updater=n||L}var O=R.prototype=new T;O.constructor=R,_(O,p.prototype),O.isPureReactComponent=!0;var X=Array.isArray,K=Object.prototype.hasOwnProperty,W={current:null},Q={key:!0,ref:!0,__self:!0,__source:!0};function J(e,a,n){var c,i={},l=null,s=null;if(a!=null)for(c in a.ref!==void 0&&(s=a.ref),a.key!==void 0&&(l=""+a.key),a)K.call(a,c)&&!Q.hasOwnProperty(c)&&(i[c]=a[c]);var d=arguments.length-2;if(d===1)i.children=n;else if(1<d){for(var u=Array(d),f=0;f<d;f++)u[f]=arguments[f+2];i.children=u}if(e&&e.defaultProps)for(c in d=e.defaultProps,d)i[c]===void 0&&(i[c]=d[c]);return{$$typeof:h,type:e,key:l,ref:s,props:i,_owner:W.current}}function re(e,a){return{$$typeof:h,type:e.type,key:a,ref:e.ref,props:e.props,_owner:e._owner}}function ee(e){return typeof e=="object"&&e!==null&&e.$$typeof===h}function oe(e){var a={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return a[n]})}var ae=/\/+/g;function te(e,a){return typeof e=="object"&&e!==null&&e.key!=null?oe(""+e.key):a.toString(36)}function U(e,a,n,c,i){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(l){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case h:case o:s=!0}}if(s)return s=e,i=i(s),e=c===""?"."+te(s,0):c,X(i)?(n="",e!=null&&(n=e.replace(ae,"$&/")+"/"),U(i,a,n,"",function(f){return f})):i!=null&&(ee(i)&&(i=re(i,n+(!i.key||s&&s.key===i.key?"":(""+i.key).replace(ae,"$&/")+"/")+e)),a.push(i)),1;if(s=0,c=c===""?".":c+":",X(e))for(var d=0;d<e.length;d++){l=e[d];var u=c+te(l,d);s+=U(l,a,n,u,i)}else if(u=H(e),typeof u=="function")for(e=u.call(e),d=0;!(l=e.next()).done;)l=l.value,u=c+te(l,d++),s+=U(l,a,n,u,i);else if(l==="object")throw a=String(e),Error("Objects are not valid as a React child (found: "+(a==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":a)+"). If you meant to render a collection of children, use an array instead.");return s}function N(e,a,n){if(e==null)return e;var c=[],i=0;return U(e,c,"","",function(l){return a.call(n,l,i++)}),c}function ne(e){if(e._status===-1){var a=e._result;a=a(),a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var w={current:null},Y={transition:null},se={ReactCurrentDispatcher:w,ReactCurrentBatchConfig:Y,ReactCurrentOwner:W};function t(){throw Error("act(...) is not supported in production builds of React.")}return y.Children={map:N,forEach:function(e,a,n){N(e,function(){a.apply(this,arguments)},n)},count:function(e){var a=0;return N(e,function(){a++}),a},toArray:function(e){return N(e,function(a){return a})||[]},only:function(e){if(!ee(e))throw Error("React.Children.only expected to receive a single React element child.");return e}},y.Component=p,y.Fragment=M,y.Profiler=z,y.PureComponent=R,y.StrictMode=m,y.Suspense=C,y.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=se,y.act=t,y.cloneElement=function(e,a,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var c=_({},e.props),i=e.key,l=e.ref,s=e._owner;if(a!=null){if(a.ref!==void 0&&(l=a.ref,s=W.current),a.key!==void 0&&(i=""+a.key),e.type&&e.type.defaultProps)var d=e.type.defaultProps;for(u in a)K.call(a,u)&&!Q.hasOwnProperty(u)&&(c[u]=a[u]===void 0&&d!==void 0?d[u]:a[u])}var u=arguments.length-2;if(u===1)c.children=n;else if(1<u){d=Array(u);for(var f=0;f<u;f++)d[f]=arguments[f+2];c.children=d}return{$$typeof:h,type:e.type,key:i,ref:l,props:c,_owner:s}},y.createContext=function(e){return e={$$typeof:A,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:j,_context:e},e.Consumer=e},y.createElement=J,y.createFactory=function(e){var a=J.bind(null,e);return a.type=e,a},y.createRef=function(){return{current:null}},y.forwardRef=function(e){return{$$typeof:V,render:e}},y.isValidElement=ee,y.lazy=function(e){return{$$typeof:I,_payload:{_status:-1,_result:e},_init:ne}},y.memo=function(e,a){return{$$typeof:E,type:e,compare:a===void 0?null:a}},y.startTransition=function(e){var a=Y.transition;Y.transition={};try{e()}finally{Y.transition=a}},y.unstable_act=t,y.useCallback=function(e,a){return w.current.useCallback(e,a)},y.useContext=function(e){return w.current.useContext(e)},y.useDebugValue=function(){},y.useDeferredValue=function(e){return w.current.useDeferredValue(e)},y.useEffect=function(e,a){return w.current.useEffect(e,a)},y.useId=function(){return w.current.useId()},y.useImperativeHandle=function(e,a,n){return w.current.useImperativeHandle(e,a,n)},y.useInsertionEffect=function(e,a){return w.current.useInsertionEffect(e,a)},y.useLayoutEffect=function(e,a){return w.current.useLayoutEffect(e,a)},y.useMemo=function(e,a){return w.current.useMemo(e,a)},y.useReducer=function(e,a,n){return w.current.useReducer(e,a,n)},y.useRef=function(e){return w.current.useRef(e)},y.useState=function(e){return w.current.useState(e)},y.useSyncExternalStore=function(e,a,n){return w.current.useSyncExternalStore(e,a,n)},y.useTransition=function(){return w.current.useTransition()},y.version="18.3.1",y}var me;function Xt(){return me||(me=1,ie.exports=Gt()),ie.exports}var B=Xt();const sa=Zt(B);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=h=>h==null?void 0:h.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Qt(h,o,M=[]){if(o==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:Kt(h),size:24,node:o,...M.length>0?{aliases:M}:{}}}/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=h=>{let o="",M=!1;for(const m of h){if(m==="-"||m==="_"||m<=" "){M=o.length>0;continue}o.length===0?o+=m.toLowerCase():o+=M?m.toUpperCase():m,M=!1}return o};/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=h=>{const o=Jt(h);return o.charAt(0).toUpperCase()+o.slice(1)};/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=(...h)=>h.filter((o,M,m)=>!!o&&o.trim()!==""&&m.indexOf(o)===M).join(" ").trim();/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function le(h){return h!=null}function ea(h,o={}){var H,L;const M=o.attributeNames??{},m=_=>M[_]??_,z=h.size??h.width??G.width,j=h.size??h.height??G.height,A=((H=h.aliases)==null?void 0:H.filter(_=>typeof _=="string"&&_.trim()!=="").map(_=>`lucide-${_}`))??[],V=[...h.name?[`lucide-${h.name}`]:[],...A],C=((L=o.className)==null?void 0:L.split(" ").filter(Boolean))??[],E=o.includeDefaultClasses===!1?de(...C):de("lucide",...V,...C),I=o.absoluteStrokeWidth?Number(o.strokeWidth??G["stroke-width"])*Number(h.size??h.width??G.width)/Number(o.size??o.width??G.width):o.strokeWidth??G["stroke-width"];return["svg",{...Object.entries(G).reduce((_,[$,p])=>(_[m($)]=p,_),{}),..."color"in o&&o.color&&{[m("stroke")]:o.color},..."size"in o&&le(o.size)&&{[m("width")]:o.size,[m("height")]:o.size},..."width"in o&&le(o.width)&&{[m("width")]:o.width},..."height"in o&&le(o.height)&&{[m("height")]:o.height},[m("stroke-width")]:I,...E&&{[m("class")]:E},[m("viewBox")]:`0 0 ${z} ${j}`,...o.hasA11yProp===!1?{[m("aria-hidden")]:"true"}:{},..."attributes"in o&&o.attributes},h.node.map(_=>{const[$,p,T]=_,R=o.nonScalingStroke?{[m("vector-effect")]:"non-scaling-stroke",...p}:p;return T?[$,R,T]:[$,R]})]}/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function ta(h,o={}){return ea(h,{...o,attributeNames:{...o.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const aa=h=>{for(const o in h)if(o.startsWith("aria-")||o==="role"||o==="title")return!0;return!1},na=B.createContext({}),ra=()=>B.useContext(na),oa=B.forwardRef(({color:h,size:o,width:M,height:m,strokeWidth:z,absoluteStrokeWidth:j,nonScalingStroke:A,className:V="",children:C,iconNode:E=[],icon:I={node:E,aliases:[],size:24},...P},H)=>{const{size:L=24,strokeWidth:_=2,absoluteStrokeWidth:$=!1,nonScalingStroke:p=!1,color:T="currentColor",className:R=""}=ra()??{},O=!!C||aa(P),[X,K,W=[]]=ta(I,{color:h??T,width:M??o??L,height:m??o??L,strokeWidth:z??_,absoluteStrokeWidth:j??$,nonScalingStroke:A??p,className:de(R,V),hasA11yProp:O,attributes:P});return B.createElement(X,{ref:H,...K},[...W.map(([Q,J])=>B.createElement(Q,J)),...Array.isArray(C)?C:[C]])});/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function r(h,o=[],M=[]){const m=typeof h=="string"?Qt(h,o,M):h,z=B.forwardRef(({className:j,...A},V)=>B.createElement(oa,{ref:V,icon:m,className:j,...A}));return m.name&&(z.displayName=Yt(m.name)),z}/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve={name:"arrow-left",size:24,node:[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]};ve.node;const ca=r(ve);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me={name:"arrow-right",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]};Me.node;const ia=r(Me);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge={name:"award",size:24,node:[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]};ge.node;const la=r(ge);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e={name:"book-open",size:24,node:[["path",{d:"M12 5v16",key:"1f6ucr"}],["path",{d:"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",key:"1fyvmf"}]]};_e.node;const da=r(_e);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we={name:"cable",size:24,node:[["path",{d:"M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z",key:"trhst0"}],["path",{d:"M17 21v-2",key:"ds4u3f"}],["path",{d:"M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10",key:"1mo9zo"}],["path",{d:"M21 21v-2",key:"eo0ou"}],["path",{d:"M3 5V3",key:"1k5hjh"}],["path",{d:"M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z",key:"1dd30t"}],["path",{d:"M7 5V3",key:"1t1388"}]]};we.node;const ha=r(we);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};be.node;const ua=r(be);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe={name:"circle-check-big",size:24,node:[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],aliases:["check-circle"]};xe.node;const ya=r(xe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze={name:"circle-check",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 9-5.5 5.5L8 12",key:"xofnsj"}]],aliases:["check-circle-2"]};ze.node;const pa=r(ze);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce={name:"circle-exclamation-point",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],aliases:["alert-circle","circle-alert"]};Ce.node;const fa=r(Ce);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e={name:"circle-question-mark",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],aliases:["help-circle","circle-help"]};$e.node;const ka=r($e);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De={name:"circle-x",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],aliases:["x-circle"]};De.node;const ma=r(De);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se={name:"clipboard-list",size:24,node:[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]};Se.node;const va=r(Se);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};je.node;const Ma=r(je);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae={name:"cloud-upload",size:24,node:[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]],aliases:["upload-cloud"]};Ae.node;const ga=r(Ae);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee={name:"cloud",size:24,node:[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]};Ee.node;const _a=r(Ee);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe={name:"compass",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}]]};Pe.node;const wa=r(Pe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le={name:"copy",size:24,node:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]};Le.node;const ba=r(Le);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re={name:"crown",size:24,node:[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]]};Re.node;const xa=r(Re);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe={name:"database",size:24,node:[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]};qe.node;const za=r(qe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve={name:"dices",size:24,node:[["rect",{width:"12",height:"12",x:"2",y:"10",rx:"2",ry:"2",key:"6agr2n"}],["path",{d:"m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6",key:"1o487t"}],["path",{d:"M6 18h.01",key:"uhywen"}],["path",{d:"M10 14h.01",key:"ssrbsk"}],["path",{d:"M15 6h.01",key:"cblpky"}],["path",{d:"M18 9h.01",key:"2061c0"}]]};Ve.node;const Ca=r(Ve);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie={name:"download",size:24,node:[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]};Ie.node;const $a=r(Ie);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te={name:"eye-off",size:24,node:[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]};Te.node;const Da=r(Te);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe={name:"eye",size:24,node:[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};Oe.node;const Sa=r(Oe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe={name:"file-spreadsheet",size:24,node:[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]]};Fe.node;const ja=r(Fe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He={name:"flag",size:24,node:[["path",{d:"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",key:"1jaruq"}]]};He.node;const Aa=r(He);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne={name:"flame",size:24,node:[["path",{d:"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",key:"1slcih"}]]};Ne.node;const Ea=r(Ne);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be={name:"footprints",size:24,node:[["path",{d:"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",key:"1dudjm"}],["path",{d:"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",key:"l2t8xc"}],["path",{d:"M16 17h4",key:"1dejxt"}],["path",{d:"M4 13h4",key:"1bwh8b"}]]};Be.node;const Pa=r(Be);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We={name:"globe",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]};We.node;const La=r(We);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue={name:"grid-3x3",size:24,node:[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"M15 3v18",key:"14nvp0"}]],aliases:["grid","grid-3-x-3"]};Ue.node;const Ra=r(Ue);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze={name:"hand",size:24,node:[["path",{d:"M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2",key:"1fvzgz"}],["path",{d:"M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2",key:"1kc0my"}],["path",{d:"M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8",key:"10h0bg"}],["path",{d:"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",key:"1s1gnw"}]]};Ze.node;const qa=r(Ze);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge={name:"heart-pulse",size:24,node:[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}],["path",{d:"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",key:"auskq0"}]]};Ge.node;const Va=r(Ge);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe={name:"key-round",size:24,node:[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]]};Xe.node;const Ia=r(Xe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke={name:"layers",size:24,node:[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],aliases:["layers-3"]};Ke.node;const Ta=r(Ke);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe={name:"layout-grid",size:24,node:[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]};Qe.node;const Oa=r(Qe);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je={name:"lightbulb",size:24,node:[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]};Je.node;const Fa=r(Je);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye={name:"link",size:24,node:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]]};Ye.node;const Ha=r(Ye);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et={name:"log-out",size:24,node:[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]};et.node;const Na=r(et);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt={name:"mail",size:24,node:[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]};tt.node;const Ba=r(tt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at={name:"map-pin",size:24,node:[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]};at.node;const Wa=r(at);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt={name:"octagon-exclamation-point",size:24,node:[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]],aliases:["alert-octagon","octagon-alert"]};nt.node;const Ua=r(nt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt={name:"paintbrush",size:24,node:[["path",{d:"m14.622 17.897-10.68-2.913",key:"vj2p1u"}],["path",{d:"M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z",key:"18tc5c"}],["path",{d:"M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15",key:"ytzfxy"}]]};rt.node;const Za=r(rt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot={name:"pause",size:24,node:[["rect",{x:"14",y:"3",width:"5",height:"18",rx:"1",key:"kaeet6"}],["rect",{x:"5",y:"3",width:"5",height:"18",rx:"1",key:"1wsw3u"}]]};ot.node;const Ga=r(ot);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st={name:"pen-line",size:24,node:[["path",{d:"M13 21h8",key:"1jsn5i"}],["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],aliases:["edit-3"]};st.node;const Xa=r(st);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct={name:"play",size:24,node:[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]]};ct.node;const Ka=r(ct);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};it.node;const Qa=r(it);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt={name:"radio",size:24,node:[["path",{d:"M16.247 7.761a6 6 0 0 1 0 8.478",key:"1fwjs5"}],["path",{d:"M19.075 4.933a10 10 0 0 1 0 14.134",key:"ehdyv1"}],["path",{d:"M4.925 19.067a10 10 0 0 1 0-14.134",key:"1q22gi"}],["path",{d:"M7.753 16.239a6 6 0 0 1 0-8.478",key:"r2q7qm"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]};lt.node;const Ja=r(lt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt={name:"refresh-cw",size:24,node:[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]};dt.node;const Ya=r(dt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht={name:"rotate-ccw",size:24,node:[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]};ht.node;const en=r(ht);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut={name:"save",size:24,node:[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]};ut.node;const tn=r(ut);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt={name:"scroll",size:24,node:[["path",{d:"M19 17V5a2 2 0 0 0-2-2H4",key:"zz82l3"}],["path",{d:"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",key:"1ph1d7"}]]};yt.node;const an=r(yt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt={name:"search",size:24,node:[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]};pt.node;const nn=r(pt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft={name:"send",size:24,node:[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]};ft.node;const rn=r(ft);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt={name:"share-2",size:24,node:[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]};kt.node;const on=r(kt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt={name:"shield-check",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]};mt.node;const sn=r(mt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt={name:"shield-exclamation-point",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]],aliases:["shield-alert"]};vt.node;const cn=r(vt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt={name:"shield",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]};Mt.node;const ln=r(Mt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt={name:"smartphone",size:24,node:[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]};gt.node;const dn=r(gt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t={name:"sparkles",size:24,node:[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],aliases:["stars"]};_t.node;const hn=r(_t);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt={name:"square-check-big",size:24,node:[["path",{d:"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",key:"2acyp4"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],aliases:["check-square"]};wt.node;const un=r(wt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt={name:"square",size:24,node:[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]]};bt.node;const yn=r(bt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt={name:"tent",size:24,node:[["path",{d:"M3.5 21 14 3",key:"1szst5"}],["path",{d:"M20.5 21 10 3",key:"1310c3"}],["path",{d:"M15.5 21 12 15l-3.5 6",key:"1ddtfw"}],["path",{d:"M2 21h20",key:"1nyx9w"}]]};xt.node;const pn=r(xt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt={name:"ticket",size:24,node:[["path",{d:"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",key:"qn84l0"}],["path",{d:"M13 5v2",key:"dyzc3o"}],["path",{d:"M13 17v2",key:"1ont0d"}],["path",{d:"M13 11v2",key:"1wjjxi"}]]};zt.node;const fn=r(zt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};Ct.node;const kn=r(Ct);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t={name:"trophy",size:24,node:[["path",{d:"M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2",key:"pwuv1l"}],["path",{d:"M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2",key:"1y54w1"}],["path",{d:"M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3",key:"e30mpu"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3",key:"i0yafy"}]]};$t.node;const mn=r($t);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt={name:"undo-2",size:24,node:[["path",{d:"M9 14 4 9l5-5",key:"102s5s"}],["path",{d:"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11",key:"f3b9sd"}]]};Dt.node;const vn=r(Dt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St={name:"user-check",size:24,node:[["path",{d:"m16 11 2 2 4-4",key:"9rsbq5"}],["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]};St.node;const Mn=r(St);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt={name:"user-plus",size:24,node:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]};jt.node;const gn=r(jt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At={name:"user-x",size:24,node:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]};At.node;const _n=r(At);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et={name:"user",size:24,node:[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]};Et.node;const wn=r(Et);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt={name:"users",size:24,node:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]};Pt.node;const bn=r(Pt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt={name:"volume-2",size:24,node:[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]};Lt.node;const xn=r(Lt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt={name:"volume-x",size:24,node:[["path",{d:"M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z",key:"1p7khw"}],["path",{d:"m16.5 14.5 5-5",key:"cul3yw"}],["path",{d:"m16.5 9.5 5 5",key:"1akey5"}]]};Rt.node;const zn=r(Rt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt={name:"wifi-off",size:24,node:[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]};qt.node;const Cn=r(qt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};Vt.node;const $n=r(Vt);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It={name:"zap",size:24,node:[["path",{d:"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",key:"1v7up4"}]]};It.node;const Dn=r(It);var he={};(function h(o,M,m,z){var j=!!(o.Worker&&o.Blob&&o.Promise&&o.OffscreenCanvas&&o.OffscreenCanvasRenderingContext2D&&o.HTMLCanvasElement&&o.HTMLCanvasElement.prototype.transferControlToOffscreen&&o.URL&&o.URL.createObjectURL),A=typeof Path2D=="function"&&typeof DOMMatrix=="function",V=(function(){if(!o.OffscreenCanvas)return!1;try{var t=new OffscreenCanvas(1,1),e=t.getContext("2d");e.fillRect(0,0,1,1);var a=t.transferToImageBitmap();e.createPattern(a,"no-repeat")}catch{return!1}return!0})();function C(){}function E(t){var e=M.exports.Promise,a=e!==void 0?e:o.Promise;return typeof a=="function"?new a(t):(t(C,C),null)}var I=(function(t,e){return{transform:function(a){if(t)return a;if(e.has(a))return e.get(a);var n=new OffscreenCanvas(a.width,a.height),c=n.getContext("2d");return c.drawImage(a,0,0),e.set(a,n),n},clear:function(){e.clear()}}})(V,new Map),P=(function(){var t=Math.floor(16.666666666666668),e,a,n={},c=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(e=function(i){var l=Math.random();return n[l]=requestAnimationFrame(function s(d){c===d||c+t-1<d?(c=d,delete n[l],i()):n[l]=requestAnimationFrame(s)}),l},a=function(i){n[i]&&cancelAnimationFrame(n[i])}):(e=function(i){return setTimeout(i,t)},a=function(i){return clearTimeout(i)}),{frame:e,cancel:a}})(),H=(function(){var t,e,a={};function n(c){function i(l,s){c.postMessage({options:l||{},callback:s})}c.init=function(s){var d=s.transferControlToOffscreen();c.postMessage({canvas:d},[d])},c.fire=function(s,d,u){if(e)return i(s,null),e;var f=Math.random().toString(36).slice(2);return e=E(function(v){function g(b){b.data.callback===f&&(delete a[f],c.removeEventListener("message",g),e=null,I.clear(),u(),v())}c.addEventListener("message",g),i(s,f),a[f]=g.bind(null,{data:{callback:f}})}),e},c.reset=function(){c.postMessage({reset:!0});for(var s in a)a[s](),delete a[s]}}return function(){if(t)return t;if(!m&&j){var c=["var CONFETTI, SIZE = {}, module = {};","("+h.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{t=new Worker(URL.createObjectURL(new Blob([c])))}catch(i){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",i),null}n(t)}return t}})(),L={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function _(t,e){return e?e(t):t}function $(t){return t!=null}function p(t,e,a){return _(t&&$(t[e])?t[e]:L[e],a)}function T(t){return t<0?0:Math.floor(t)}function R(t,e){return Math.floor(Math.random()*(e-t))+t}function O(t){return parseInt(t,16)}function X(t){return t.map(K)}function K(t){var e=String(t).replace(/[^0-9a-f]/gi,"");return e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),{r:O(e.substring(0,2)),g:O(e.substring(2,4)),b:O(e.substring(4,6))}}function W(t){var e=p(t,"origin",Object);return e.x=p(e,"x",Number),e.y=p(e,"y",Number),e}function Q(t){t.width=document.documentElement.clientWidth,t.height=document.documentElement.clientHeight}function J(t){var e=t.getBoundingClientRect();t.width=e.width,t.height=e.height}function re(t){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=t,e}function ee(t,e,a,n,c,i,l,s,d){t.save(),t.translate(e,a),t.rotate(i),t.scale(n,c),t.arc(0,0,1,l,s,d),t.restore()}function oe(t){var e=t.angle*(Math.PI/180),a=t.spread*(Math.PI/180);return{x:t.x,y:t.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:t.startVelocity*.5+Math.random()*t.startVelocity,angle2D:-e+(.5*a-Math.random()*a),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:t.color,shape:t.shape,tick:0,totalTicks:t.ticks,decay:t.decay,drift:t.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:t.gravity*3,ovalScalar:.6,scalar:t.scalar,flat:t.flat}}function ae(t,e){e.x+=Math.cos(e.angle2D)*e.velocity+e.drift,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.velocity*=e.decay,e.flat?(e.wobble=0,e.wobbleX=e.x+10*e.scalar,e.wobbleY=e.y+10*e.scalar,e.tiltSin=0,e.tiltCos=0,e.random=1):(e.wobble+=e.wobbleSpeed,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble),e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+2);var a=e.tick++/e.totalTicks,n=e.x+e.random*e.tiltCos,c=e.y+e.random*e.tiltSin,i=e.wobbleX+e.random*e.tiltCos,l=e.wobbleY+e.random*e.tiltSin;if(t.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-a)+")",t.beginPath(),A&&e.shape.type==="path"&&typeof e.shape.path=="string"&&Array.isArray(e.shape.matrix))t.fill(w(e.shape.path,e.shape.matrix,e.x,e.y,Math.abs(i-n)*.1,Math.abs(l-c)*.1,Math.PI/10*e.wobble));else if(e.shape.type==="bitmap"){var s=Math.PI/10*e.wobble,d=Math.abs(i-n)*.1,u=Math.abs(l-c)*.1,f=e.shape.bitmap.width*e.scalar,v=e.shape.bitmap.height*e.scalar,g=new DOMMatrix([Math.cos(s)*d,Math.sin(s)*d,-Math.sin(s)*u,Math.cos(s)*u,e.x,e.y]);g.multiplySelf(new DOMMatrix(e.shape.matrix));var b=t.createPattern(I.transform(e.shape.bitmap),"no-repeat");b.setTransform(g),t.globalAlpha=1-a,t.fillStyle=b,t.fillRect(e.x-f/2,e.y-v/2,f,v),t.globalAlpha=1}else if(e.shape==="circle")t.ellipse?t.ellipse(e.x,e.y,Math.abs(i-n)*e.ovalScalar,Math.abs(l-c)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):ee(t,e.x,e.y,Math.abs(i-n)*e.ovalScalar,Math.abs(l-c)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI);else if(e.shape==="star")for(var k=Math.PI/2*3,x=4*e.scalar,D=8*e.scalar,S=e.x,F=e.y,Z=5,q=Math.PI/Z;Z--;)S=e.x+Math.cos(k)*D,F=e.y+Math.sin(k)*D,t.lineTo(S,F),k+=q,S=e.x+Math.cos(k)*x,F=e.y+Math.sin(k)*x,t.lineTo(S,F),k+=q;else t.moveTo(Math.floor(e.x),Math.floor(e.y)),t.lineTo(Math.floor(e.wobbleX),Math.floor(c)),t.lineTo(Math.floor(i),Math.floor(l)),t.lineTo(Math.floor(n),Math.floor(e.wobbleY));return t.closePath(),t.fill(),e.tick<e.totalTicks}function te(t,e,a,n,c){var i=e.slice(),l=t.getContext("2d"),s,d,u=E(function(f){function v(){s=d=null,l.clearRect(0,0,n.width,n.height),I.clear(),c(),f()}function g(){m&&!(n.width===z.width&&n.height===z.height)&&(n.width=t.width=z.width,n.height=t.height=z.height),!n.width&&!n.height&&(a(t),n.width=t.width,n.height=t.height),l.clearRect(0,0,n.width,n.height),i=i.filter(function(b){return ae(l,b)}),i.length?s=P.frame(g):v()}s=P.frame(g),d=v});return{addFettis:function(f){return i=i.concat(f),u},canvas:t,promise:u,reset:function(){s&&P.cancel(s),d&&d()}}}function U(t,e){var a=!t,n=!!p(e||{},"resize"),c=!1,i=p(e,"disableForReducedMotion",Boolean),l=j&&!!p(e||{},"useWorker"),s=l?H():null,d=a?Q:J,u=t&&s?!!t.__confetti_initialized:!1,f=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,v;function g(k,x,D){for(var S=p(k,"particleCount",T),F=p(k,"angle",Number),Z=p(k,"spread",Number),q=p(k,"startVelocity",Number),Tt=p(k,"decay",Number),Ot=p(k,"gravity",Number),Ft=p(k,"drift",Number),ue=p(k,"colors",X),Ht=p(k,"ticks",Number),ye=p(k,"shapes"),Nt=p(k,"scalar"),Bt=!!p(k,"flat"),pe=W(k),fe=S,ce=[],Wt=t.width*pe.x,Ut=t.height*pe.y;fe--;)ce.push(oe({x:Wt,y:Ut,angle:F,spread:Z,startVelocity:q,color:ue[fe%ue.length],shape:ye[R(0,ye.length)],ticks:Ht,decay:Tt,gravity:Ot,drift:Ft,scalar:Nt,flat:Bt}));return v?v.addFettis(ce):(v=te(t,ce,d,x,D),v.promise)}function b(k){var x=i||p(k,"disableForReducedMotion",Boolean),D=p(k,"zIndex",Number);if(x&&f)return E(function(q){q()});a&&v?t=v.canvas:a&&!t&&(t=re(D),document.body.appendChild(t)),n&&!u&&d(t);var S={width:t.width,height:t.height};s&&!u&&s.init(t),u=!0,s&&(t.__confetti_initialized=!0);function F(){if(s){var q={getBoundingClientRect:function(){if(!a)return t.getBoundingClientRect()}};d(q),s.postMessage({resize:{width:q.width,height:q.height}});return}S.width=S.height=null}function Z(){v=null,n&&(c=!1,o.removeEventListener("resize",F)),a&&t&&(document.body.contains(t)&&document.body.removeChild(t),t=null,u=!1)}return n&&!c&&(c=!0,o.addEventListener("resize",F,!1)),s?s.fire(k,S,Z):g(k,S,Z)}return b.reset=function(){s&&s.reset(),v&&v.reset()},b}var N;function ne(){return N||(N=U(null,{useWorker:!0,resize:!0})),N}function w(t,e,a,n,c,i,l){var s=new Path2D(t),d=new Path2D;d.addPath(s,new DOMMatrix(e));var u=new Path2D;return u.addPath(d,new DOMMatrix([Math.cos(l)*c,Math.sin(l)*c,-Math.sin(l)*i,Math.cos(l)*i,a,n])),u}function Y(t){if(!A)throw new Error("path confetti are not supported in this browser");var e,a;typeof t=="string"?e=t:(e=t.path,a=t.matrix);var n=new Path2D(e),c=document.createElement("canvas"),i=c.getContext("2d");if(!a){for(var l=1e3,s=l,d=l,u=0,f=0,v,g,b=0;b<l;b+=2)for(var k=0;k<l;k+=2)i.isPointInPath(n,b,k,"nonzero")&&(s=Math.min(s,b),d=Math.min(d,k),u=Math.max(u,b),f=Math.max(f,k));v=u-s,g=f-d;var x=10,D=Math.min(x/v,x/g);a=[D,0,0,D,-Math.round(v/2+s)*D,-Math.round(g/2+d)*D]}return{type:"path",path:e,matrix:a}}function se(t){var e,a=1,n="#000000",c='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof t=="string"?e=t:(e=t.text,a="scalar"in t?t.scalar:a,c="fontFamily"in t?t.fontFamily:c,n="color"in t?t.color:n);var i=10*a,l=""+i+"px "+c,s=new OffscreenCanvas(i,i),d=s.getContext("2d");d.font=l;var u=d.measureText(e),f=Math.ceil(u.actualBoundingBoxRight+u.actualBoundingBoxLeft),v=Math.ceil(u.actualBoundingBoxAscent+u.actualBoundingBoxDescent),g=2,b=u.actualBoundingBoxLeft+g,k=u.actualBoundingBoxAscent+g;f+=g+g,v+=g+g,s=new OffscreenCanvas(f,v),d=s.getContext("2d"),d.font=l,d.fillStyle=n,d.fillText(e,b,k);var x=1/a;return{type:"bitmap",bitmap:s.transferToImageBitmap(),matrix:[x,0,0,x,-f*x/2,-v*x/2]}}M.exports=function(){return ne().apply(this,arguments)},M.exports.reset=function(){ne().reset()},M.exports.create=U,M.exports.shapeFromPath=Y,M.exports.shapeFromText=se})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),he,!1);const Sn=he.exports;he.exports.create;export{Sa as $,la as A,on as B,wa as C,za as D,Ya as E,Pa as F,dn as G,Va as H,Ca as I,pn as J,Ga as K,Na as L,fn as M,Ra as N,da as O,Ka as P,va as Q,en as R,sn as S,mn as T,bn as U,zn as V,Cn as W,Ja as X,ua as Y,Dn as Z,Za as _,B as a,Da as a0,vn as a1,rn as a2,qa as a3,Ua as a4,un as a5,yn as a6,ga as a7,$n as a8,ja as a9,$a as aa,fa as ab,La as ac,cn as ad,nn as ae,Xa as af,Aa as ag,Ta as ah,Mn as ai,_n as aj,Wa as ak,Ha as al,ba as am,Ba as an,Ia as ao,sa as ap,wn as b,Oa as c,_a as d,xn as e,hn as f,Zt as g,gn as h,ka as i,xa as j,an as k,ha as l,Ma as m,pa as n,ma as o,Fa as p,Ea as q,Xt as r,tn as s,Sn as t,ln as u,kn as v,Qa as w,ia as x,ya as y,ca as z};
