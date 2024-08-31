'use client';

import Image from 'next/image';
import {
  Wrapper,
  Inner,
  LogoContainer,
  Nav,
  CallToActions,
  AbsoluteLinks,
  BurgerMenu,
} from './styles';
import ic_bars from '../../../../public/svgs/ic_bars.svg';
import { GetStartedButton } from '@/components';
import AnimatedLink from '@/components/Common/AnimatedLink';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { links, menu } from './constants';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  return (
    <Wrapper>
      <Inner className="flex items-center justify-between">
        <div className="w-1/3 flex items-center justify-start">
          <Link href="/" className="flex-shrink-0">
            <LogoContainer className="flex items-center">
              <Image src="/images/logo.png" alt="compadre_logo" width={140} height={30} priority />
            </LogoContainer>
          </Link>
          <BurgerMenu onClick={() => setIsOpen(!isOpen)} className="ml-4 md:hidden">
            <motion.div
              variants={menu}
              animate={isOpen ? 'open' : 'closed'}
              initial="closed"
            ></motion.div>
            <Image src={ic_bars} alt="bars" />
          </BurgerMenu>
        </div>
        <div className="w-1/3 flex justify-center">
          <Nav className={`items-center justify-center ${isOpen ? 'flex' : 'hidden md:flex'}`}>
            {links.map((link, i) => (
              <Link href={link.url} key={i} className="mx-4">
                <AnimatedLink key={i} title={link.linkTo} />
              </Link>
            ))}
          </Nav>
        </div>
        <div className="w-1/3 flex justify-end">
          <CallToActions className={`items-center space-x-4 ${isOpen ? 'flex' : 'hidden md:flex'}`}>
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <AnimatedLink title="Dashboard" />
                </Link>
                <Link href={`/dashboard/profile/${user?.id}`}>
                  <AnimatedLink title="Profile" />
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <AnimatedLink title="Login" />
                </Link>
                <GetStartedButton padding="0.5rem 0.75rem" />
              </>
            )}
          </CallToActions>
        </div>
      </Inner>
    </Wrapper>
  );
};

export default Header;