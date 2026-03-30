const pattern = '[\u001B\u009B][[\]()#;?]*(?:(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><~]|(?:[\dA-PR-TZcf-nq-uy=><~]))';

export default function ansiRegex({ onlyFirst = false }: { onlyFirst?: boolean } = {}) {
  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}
