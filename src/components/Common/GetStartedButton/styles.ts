'use client';
import Link from 'next/link';
import { styled } from 'styled-components';

export const LinkTo = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6.25rem;
  background: #16a34a; /* Tailwind's bg-green-600 */
  color: var(--white);
  font-size: 1rem;
  font-weight: 600;
`;
