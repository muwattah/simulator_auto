import type { RecommendationInput, RecommendationResult, Configuration } from '../types';
import { packages, budgetBands } from '../data/demoData';
import { getCompatibleProducts } from './compatibility';

export function recommend(input: RecommendationInput): RecommendationResult {
  const band = budgetBands.find((b) => b.id === input.budgetBand);
  const maxBudget = band?.max ?? 2500;

  const professionPackages = packages.filter(
    (p) => p.popularFor?.includes(input.professionId)
  );

  const sorted = [...professionPackages].sort((a, b) => b.price - a.price);
  let chosen = sorted.find((p) => p.price <= maxBudget);

  if (!chosen) {
    chosen = [...packages].sort((a, b) => b.price - a.price).find((p) => p.price <= maxBudget);
  }

  if (!chosen) {
    chosen = packages.find((p) => p.id === 'starter-algemeen') ?? packages[0];
  }

  const compatibleIds = new Set(
    getCompatibleProducts(input.vehicleVariantId).map((p) => p.id)
  );
  const productIds = chosen.items
    .map((i) => i.productId)
    .filter((id) => compatibleIds.has(id) || id === 'montage-compleet');

  const estimatedExcl = chosen.price;

  const professionName =
    {
      elektricien: 'elektricien',
      loodgieter: 'loodgieter',
      hvac: 'HVAC-technicus',
      schrijnwerker: 'schrijnwerker',
      bouw: 'bouwpro',
      schilder: 'schilder',
      installateur: 'installateur',
      technieker: 'servicetechnieker',
      koerier: 'koerier',
      andere: 'jouw vak',
    }[input.professionId] ?? 'jouw beroep';

  return {
    packageId: chosen.id,
    productIds,
    title: `Aanbevolen voor ${professionName}`,
    rationale: chosen.badge
      ? `${chosen.badge}. ${chosen.description}`
      : chosen.description,
    estimatedExcl,
  };
}

export function recommendForProfession(
  professionId: string,
  vehicleVariantId: string
): RecommendationResult {
  return recommend({
    vehicleVariantId,
    professionId,
    budgetBand: '1500_2500',
  });
}
