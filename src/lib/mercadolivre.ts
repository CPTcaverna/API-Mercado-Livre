export function mercadoLivreItemUrl(mlItemId: string) {
  const withDash = mlItemId.replace(/^([A-Z]{3})(\d+)$/, '$1-$2')
  return `https://produto.mercadolivre.com.br/${withDash}`
}
