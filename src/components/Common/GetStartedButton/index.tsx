import Link from 'next/link';
import { LinkTo } from './styles';

const GetStartedButton = ({ padding }: { padding: string }) => {
  return (
    <div className='bg-green-600 rounded-xl'>
       <LinkTo
        style={{
          padding: padding,
        }}
        href="/dashboard"
      >
        Get Started
      </LinkTo>
    </div>
     
  );
};

export default GetStartedButton;