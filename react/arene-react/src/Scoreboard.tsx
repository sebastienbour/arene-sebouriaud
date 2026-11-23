type Props = {readonly score: number}

export function Scoreboard({score}: Props){
    return <p>Score : {score}</p>
}