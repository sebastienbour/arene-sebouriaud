type Props = { readonly name: string }

export function Bonjour({ name }: Props) {
  return <p>Bonjour {name}</p>
}