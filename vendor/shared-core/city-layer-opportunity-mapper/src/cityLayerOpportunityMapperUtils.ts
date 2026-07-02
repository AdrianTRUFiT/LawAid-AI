export function nowIso(): string {
  return new Date().toISOString();
}

export function makeCityLayerOpportunityMapId(subjectId: string): string {
  return `city_layer_opportunity_${subjectId}`;
}