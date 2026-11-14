export interface GreetOptions {
  lang?: string;
  phone?: string;
  style?: 'formal' | 'casual' | 'emoji' | 'upper' | 'lower' | 'minimal';
  seed?: number;
  group?: string;
  hour?: number;
  date?: Date;
  mode?: Mode;
  mentions?: string[];
}

export type Mode =
  | 'greet' | 'welcome' | 'first' | 'time'
  | 'farewell' | 'thank' | 'birthday' | 'congrats' | 'random';

export interface GreetInfo {
  name: string;
  greeting: string;
  lang: string;
  mode: string;
}

export interface GreetInResult {
  lang: string;
  greeting: string;
  mode: string;
}

export interface WhatsAppGreeting extends GreetInfo {
  payload: { text: string; mentions?: string[] };
}

export function greet(name: string | string[], options?: GreetOptions | string): string;
export function greetFor(name: string | string[], phone?: string, options?: GreetOptions | string): string;
export function greetAll(names: string[] | string, options?: GreetOptions): string[];
export function greetIn(name: string | string[], langs: string[] | string, options?: GreetOptions): GreetInResult[];
export function greetInfo(name: string | string[], options?: GreetOptions): GreetInfo;
export function greetRandom(name: string | string[], options?: GreetOptions): string;
export function randomLang(seed?: number): string;
export function welcome(name: string | string[], options?: GreetOptions | string): string;
export function first(name: string | string[], options?: GreetOptions | string): string;
export function timeGreet(name: string | string[], options?: GreetOptions | string): string;
export function farewell(name: string | string[], options?: GreetOptions | string): string;
export function thank(name: string | string[], options?: GreetOptions | string): string;
export function birthday(name: string | string[], options?: GreetOptions | string): string;
export function congrats(name: string | string[], options?: GreetOptions | string): string;
export function forWhatsApp(name: string | string[], options?: GreetOptions): WhatsAppGreeting;
export function phoneToLang(phone?: string | null): string | null;
export function validatePhone(phone?: string | null): string | null;
export function config(opts?: { langs?: object; country?: object; fallback?: string }): object;
export function languages(): string[];
export function countries(): Record<string, string>;
export function langName(code: string): string;

declare const _default: typeof greet;
export default _default;
