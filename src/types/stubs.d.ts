// Stub type declarations — suppresses "Cannot find module" errors before npm install.
// Auto-replaced once you run: npm install

// ─── React ───────────────────────────────────────────────────────────────────
declare module 'react' {
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => JSX.Element | null;
  export type ReactNode = JSX.Element | string | number | boolean | null | undefined | ReactNode[];
  export type ReactElement = JSX.Element;
  export type ComponentType<P = {}> = FC<P>;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prev: S) => S);
  export type Ref<T> = { current: T | null };
  export type MutableRefObject<T> = { current: T };
  export type CSSProperties = { [key: string]: any };
  export type Key = string | number;
  export type Context<T> = {
    Provider: ComponentType<{ value: T; children?: ReactNode }>;
    Consumer: any;
    displayName?: string;
  };
  export interface PropsWithChildren<P = unknown> { children?: ReactNode; }
  export interface HTMLAttributes<T> { [key: string]: any; }
  export interface SVGProps<T> { [key: string]: any; }
  export interface ChangeEvent<T = Element> { target: T & { value: any }; preventDefault(): void; }
  export interface MouseEvent<T = Element> { preventDefault(): void; stopPropagation(): void; }
  export interface FormEvent<T = Element> { preventDefault(): void; }
  export interface KeyboardEvent<T = Element> { key: string; preventDefault(): void; }
  export interface FocusEvent<T = Element> { target: T & { value: any }; }
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): Ref<T>;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useContext<T>(context: Context<T>): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, Dispatch<A>];
  export function useId(): string;
  export function createContext<T>(defaultValue: T): Context<T>;
  export function memo<T extends ComponentType<any>>(component: T, compare?: (prev: any, next: any) => boolean): T;
  export function forwardRef<T, P = {}>(render: (props: P, ref: any) => JSX.Element | null): ComponentType<P & { ref?: any }>;
  export function cloneElement(element: any, props?: any, ...children: any[]): JSX.Element;
  export function createElement(type: any, props?: any, ...children: any[]): JSX.Element;
  export function isValidElement(obj: any): boolean;
  export const Children: any;
  export const Fragment: any;
  export const StrictMode: any;
  export const Suspense: any;
  export const createRef: any;
  export default any;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): JSX.Element;
  export function jsxs(type: any, props: any, key?: any): JSX.Element;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export function jsxDEV(type: any, props: any, key: any, isStaticChildren: boolean, source: any, self: any): JSX.Element;
  export const Fragment: any;
}

// ─── React DOM ────────────────────────────────────────────────────────────────
declare module 'react-dom' {
  export function createPortal(children: any, container: Element): any;
  export function render(element: any, container: Element | null): void;
  export function unmountComponentAtNode(container: Element): boolean;
  export const flushSync: any;
}

declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment, options?: any): Root;
  export function hydrateRoot(container: Element | Document, initialChildren: ReactNode, options?: any): Root;
}

// ─── JSX global types ─────────────────────────────────────────────────────────
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements { [elemName: string]: any; }
  interface IntrinsicAttributes { key?: any; }
  interface ElementAttributesProperty { props: {}; }
  interface ElementChildrenAttribute { children: {}; }
}

// ─── Lucide React ─────────────────────────────────────────────────────────────
declare module 'lucide-react' {
  import type { FC } from 'react';
  interface IconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
    style?: any;
    onClick?: () => void;
  }
  type LucideIcon = FC<IconProps>;
  export const TrendingUp: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowDownRight: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Activity: LucideIcon;
  export const Layers: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Moon: LucideIcon;
  export const Sun: LucideIcon;
  export const Presentation: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const Landmark: LucideIcon;
  export const Building2: LucideIcon;
  export const User: LucideIcon;
  export const Calculator: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Download: LucideIcon;
  export const Filter: LucideIcon;
  export const Search: LucideIcon;
  export const BarChart2: LucideIcon;
  export const PieChart: LucideIcon;
  export const Globe: LucideIcon;
  export const Zap: LucideIcon;
  export const ZapOff: LucideIcon;
  export const Info: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const XCircle: LucideIcon;
  export const Lock: LucideIcon;
  export const Unlock: LucideIcon;
  export const Settings: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Copy: LucideIcon;
  export const MapPin: LucideIcon;
  export const Clock: LucideIcon;
  export const Calendar: LucideIcon;
  export const FileText: LucideIcon;
  export const UploadCloud: LucideIcon;
  export const Bot: LucideIcon;
  export const Brain: LucideIcon;
  export const Cpu: LucideIcon;
  export const Database: LucideIcon;
  export const Network: LucideIcon;
  export const Radio: LucideIcon;
  export const Satellite: LucideIcon;
  export const Share2: LucideIcon;
  export const Signal: LucideIcon;
  export const ToggleLeft: LucideIcon;
  export const ToggleRight: LucideIcon;
  [key: string]: LucideIcon;
}

// ─── Recharts ────────────────────────────────────────────────────────────────
declare module 'recharts' {
  import type { FC } from 'react';
  export const AreaChart: FC<any>;
  export const Area: FC<any>;
  export const BarChart: FC<any>;
  export const Bar: FC<any>;
  export const LineChart: FC<any>;
  export const Line: FC<any>;
  export const PieChart: FC<any>;
  export const Pie: FC<any>;
  export const Cell: FC<any>;
  export const XAxis: FC<any>;
  export const YAxis: FC<any>;
  export const CartesianGrid: FC<any>;
  export const Tooltip: FC<any>;
  export const Legend: FC<any>;
  export const ResponsiveContainer: FC<any>;
  export const ComposedChart: FC<any>;
  export const RadarChart: FC<any>;
  export const Radar: FC<any>;
  export const PolarGrid: FC<any>;
  export const PolarAngleAxis: FC<any>;
  export const PolarRadiusAxis: FC<any>;
  export const ScatterChart: FC<any>;
  export const Scatter: FC<any>;
  export const ReferenceLine: FC<any>;
  export const ReferenceArea: FC<any>;
  export const Brush: FC<any>;
  export const Label: FC<any>;
  export const LabelList: FC<any>;
  export const Funnel: FC<any>;
  export const FunnelChart: FC<any>;
}

// ─── Motion / Framer Motion ──────────────────────────────────────────────────
declare module 'motion' {
  import type { FC, ComponentType } from 'react';
  export const motion: { [K in keyof JSX.IntrinsicElements]: FC<any> } & { custom: (component: any) => FC<any> };
  export const AnimatePresence: FC<any>;
  export function useAnimate(): any;
  export function useAnimation(): any;
  export function useMotionValue(initial: number): any;
  export function useTransform(value: any, inputRange: number[], outputRange: number[]): any;
  export function useSpring(value: any, options?: any): any;
  export function animate(target: any, keyframes: any, options?: any): any;
  export function stagger(duration: number, options?: any): any;
  export default motion;
}

// ─── Google GenAI ─────────────────────────────────────────────────────────────
declare module '@google/genai' {
  export interface GenerateContentResponse {
    text?: string;
    candidates?: Array<{
      content: { parts: Array<{ text: string }>; role: string };
      finishReason: string;
    }>;
  }
  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    models: {
      generateContent(options: {
        model: string;
        contents: string | any[];
        config?: { responseMimeType?: string; temperature?: number; maxOutputTokens?: number };
      }): Promise<GenerateContentResponse>;
    };
  }
  export const GoogleGenerativeAI: typeof GoogleGenAI;
  export type GenerateContentResult = GenerateContentResponse;
}

// ─── Express ─────────────────────────────────────────────────────────────────
declare module 'express' {
  interface Request { body: any; params: any; query: any; headers: any; method: string; url: string; }
  interface Response {
    json(data: any): void;
    status(code: number): Response;
    send(data: any): void;
    sendFile(path: string): void;
  }
  interface NextFunction { (err?: any): void; }
  interface Application {
    use(...args: any[]): this;
    get(path: string, ...handlers: any[]): this;
    post(path: string, ...handlers: any[]): this;
    put(path: string, ...handlers: any[]): this;
    delete(path: string, ...handlers: any[]): this;
    listen(port: number, host?: string, callback?: () => void): any;
  }
  interface Router { use(...args: any[]): this; get(...args: any[]): this; post(...args: any[]): this; }
  interface IRouter extends Router {}
  function express(): Application;
  namespace express {
    function json(): any;
    function urlencoded(options?: any): any;
    function static(root: string, options?: any): any;
    const Router: any;
  }
  export = express;
}

// ─── Dotenv ───────────────────────────────────────────────────────────────────
declare module 'dotenv' {
  export function config(options?: { path?: string; encoding?: string; override?: boolean }): {
    error?: Error;
    parsed?: Record<string, string>;
  };
  export function populate(target: Record<string, any>, source: Record<string, string>, options?: any): void;
  export const DotenvModule: any;
}

// ─── Vite ────────────────────────────────────────────────────────────────────
declare module 'vite' {
  export type UserConfig = Record<string, any>;
  export function defineConfig(config: UserConfig | ((env: any) => UserConfig)): UserConfig;
  export function createServer(options?: any): Promise<any>;
  export function build(options?: any): Promise<any>;
  export function preview(options?: any): Promise<any>;
  export type Plugin = any;
}

declare module '@vitejs/plugin-react' {
  function plugin(options?: any): any;
  export default plugin;
}

declare module '@tailwindcss/vite' {
  function plugin(options?: any): any;
  export default plugin;
}

// ─── Node built-ins (for server.ts) ──────────────────────────────────────────
declare module 'path' {
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export function parse(path: string): { root: string; dir: string; base: string; ext: string; name: string };
  export const sep: string;
  export const delimiter: string;
}

declare module 'url' {
  export function fileURLToPath(url: string | URL): string;
  export function pathToFileURL(path: string): URL;
}

declare module 'fs' {
  export function readFileSync(path: string, encoding?: string): string | Buffer;
  export function writeFileSync(path: string, data: string | Buffer): void;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: any): void;
}

// ─── Vite client types (import.meta.env) ──────────────────────────────────────
interface ImportMeta {
  readonly env: {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
    [key: string]: any;
  };
  readonly hot?: {
    accept(): void;
    dispose(cb: () => void): void;
  };
  readonly url: string;
}

// Global process for server-side code
declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  argv: string[];
  cwd(): string;
  platform: string;
  version: string;
};
