import React from 'react';
import { Helmet } from 'react-helmet-async';
import Title from 'components/Title';
import SubTitle from 'components/SubTitle';
import StackList from 'components/StackList';

const AboutPage = () => {
  return (
    <>
      <Helmet title="About" />
      <Title>About Page</Title>
      <SubTitle>Use Stack List</SubTitle>
      <StackList />
    </>
  );
};

export default AboutPage;
