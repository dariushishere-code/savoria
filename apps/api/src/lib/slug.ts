export function slugify(text: string){
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
export async function uniqueSlug(base: string, exists: (s: string)=>Promise<boolean>){
  let slug = slugify(base);
  if (!(await exists(slug))) return slug;
  let i = 2;
  while (await exists(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
