import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Select,
  Input,
  useToast,
  Container,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [userId, setUserId] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleInitiateBankLink = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bank/link/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          institution_id: institutionId,
          redirect_url: window.location.origin + '/callback',
        }),
      });
      const data = await response.json();
      window.location.href = data.consent_link;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/accounts?user_id=${userId}`);
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/transactions?account_id=${accountId}&months=12`
      );
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/statistics?user_id=${userId}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryChart = () => {
    if (!statistics?.category_spending) return null;

    const data = Object.entries(statistics.category_spending).map(([name, value]) => ({
      name,
      value: Math.abs(value),
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderMonthlyChart = () => {
    if (!statistics?.monthly_spending) return null;

    const data = Object.entries(statistics.monthly_spending)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month,
        amount: Math.abs(amount),
      }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" name="Monthly Spending" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ChakraProvider>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading>Referlut API Test Dashboard</Heading>

          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Input
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
                <Input
                  placeholder="Enter Institution ID"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                />
                <Button
                  colorScheme="blue"
                  onClick={handleInitiateBankLink}
                  isLoading={loading}
                >
                  Link Bank Account
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Tabs>
            <TabList>
              <Tab>Accounts</Tab>
              <Tab>Transactions</Tab>
              <Tab>Statistics</Tab>
              <Tab>Insights</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4}>
                  <Button onClick={fetchAccounts} isLoading={loading}>
                    Fetch Accounts
                  </Button>
                  {accounts.map((account) => (
                    <Card key={account.id} width="100%">
                      <CardBody>
                        <Text>Account ID: {account.id}</Text>
                        <Text>IBAN: {account.iban}</Text>
                        <Text>Currency: {account.currency}</Text>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                  <Select
                    placeholder="Select account"
                    onChange={(e) => fetchTransactions(e.target.value)}
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.iban}
                      </option>
                    ))}
                  </Select>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Amount</Th>
                        <Th>Description</Th>
                        <Th>Category</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.map((transaction, index) => (
                        <Tr key={index}>
                          <Td>{transaction.bookingDate}</Td>
                          <Td>{transaction.transactionAmount.amount}</Td>
                          <Td>{transaction.remittanceInformationUnstructured}</Td>
                          <Td>{transaction.category}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                  <Button onClick={fetchStatistics} isLoading={loading}>
                    Fetch Statistics
                  </Button>
                  {statistics && (
                    <>
                      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <GridItem>
                          <Card>
                            <CardBody>
                              <Stat>
                                <StatLabel>Total Spending</StatLabel>
                                <StatNumber>£{statistics.total_spending.toFixed(2)}</StatNumber>
                              </Stat>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem>
                          <Card>
                            <CardBody>
                              <Stat>
                                <StatLabel>Total Income</StatLabel>
                                <StatNumber>£{statistics.total_income.toFixed(2)}</StatNumber>
                              </Stat>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem>
                          <Card>
                            <CardBody>
                              <Stat>
                                <StatLabel>Net Position</StatLabel>
                                <StatNumber>
                                  £{(statistics.total_income - statistics.total_spending).toFixed(2)}
                                </StatNumber>
                                <StatHelpText>
                                  <StatArrow
                                    type={
                                      statistics.total_income > statistics.total_spending
                                        ? 'increase'
                                        : 'decrease'
                                    }
                                  />
                                </StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                        </GridItem>
                      </Grid>

                      <Card width="100%">
                        <CardHeader>
                          <Heading size="md">Spending by Category</Heading>
                        </CardHeader>
                        <CardBody>{renderCategoryChart()}</CardBody>
                      </Card>

                      <Card width="100%">
                        <CardHeader>
                          <Heading size="md">Monthly Spending Trend</Heading>
                        </CardHeader>
                        <CardBody>{renderMonthlyChart()}</CardBody>
                      </Card>

                      <Card width="100%">
                        <CardHeader>
                          <Heading size="md">Top Merchants</Heading>
                        </CardHeader>
                        <CardBody>
                          <Table>
                            <Thead>
                              <Tr>
                                <Th>Merchant</Th>
                                <Th>Amount</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {Object.entries(statistics.top_merchants).map(([merchant, amount]) => (
                                <Tr key={merchant}>
                                  <Td>{merchant}</Td>
                                  <Td>£{Math.abs(amount).toFixed(2)}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </Card>

                      <Card width="100%">
                        <CardHeader>
                          <Heading size="md">Savings Opportunities</Heading>
                        </CardHeader>
                        <CardBody>
                          {statistics.savings_opportunities.map((opportunity, index) => (
                            <Alert key={index} status="info" mb={4}>
                              <AlertIcon />
                              <Box>
                                <AlertTitle>{opportunity.category}</AlertTitle>
                                <AlertDescription>
                                  Current Spending: £{opportunity.current_spending.toFixed(2)}
                                  <br />
                                  {opportunity.savings_suggestions}
                                </AlertDescription>
                              </Box>
                            </Alert>
                          ))}
                        </CardBody>
                      </Card>
                    </>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                  <Button onClick={fetchInsights} isLoading={loading}>
                    Get AI Insights
                  </Button>
                  {insights && (
                    <Card width="100%">
                      <CardBody>
                        <Text whiteSpace="pre-wrap">{insights}</Text>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App; 