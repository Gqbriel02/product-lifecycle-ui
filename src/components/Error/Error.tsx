import styles from './Error.module.css';

interface ErrorProps {
    errorMessage: string | null;
    id?: string;
    style?: React.CSSProperties;
    ariaLive?: 'polite' | 'off' | 'assertive';
}

const Error: React.FC<ErrorProps> = ({errorMessage, id = '', style = {}, ariaLive = 'polite'}) => {
    if (!errorMessage) return null;

    return (
        <div className="w-100" aria-live={ariaLive}>
            <p className={`badge text-wrap ${styles['error-message']}`} id={id} style={style}>
                {errorMessage}
            </p>
        </div>
    );
};

export default Error;